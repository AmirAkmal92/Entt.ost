using System;
using System.Activities.Expressions;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Bespoke.Ost.AddressBooks.Domain;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using Newtonsoft.Json.Linq;

namespace web.sph.App_Code
{
    [RoutePrefix("address-books")]
    public class CustomAddressBookController : BaseApiController
    {


        [HttpPut]
        [Route("groups/{group}/{newName}")]
        public async Task<IHttpActionResult> ChangeGroupName(string group, string newName)
        {
            var list = new List<string>();
            var rows = int.MaxValue;
            var page = 0;
            const int size = 50;
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<AddressBook>>();
            var query = $@"{{
   ""query"": {{
      ""bool"": {{
         ""must"": [
            {{
               ""term"": {{
                  ""CreatedBy"": {{
                     ""value"": ""{User.Identity.Name}""
                  }}
               }}
            }},            
            {{
               ""term"": {{
                  ""Groups"": {{
                     ""value"": ""{group}""
                  }}
               }}
            }}
         ]
      }}
   }},
   ""fields"": []
}}";
            while (list.Count < rows)
            {
                page++;

                var queryString = $"from={size * (page - 1)}&size={size}";

                var response = await repos.SearchAsync(query, queryString);
                var json = JObject.Parse(response);
                var addresses = from f in json.SelectToken("$.hits.hits")
                                select f.SelectToken("_id").Value<string>();

                list.AddRange(addresses);
                rows = json.SelectToken("$.hits.total").Value<int>();
            }

            var sql = ObjectBuilder.GetObject<IRepository<AddressBook>>();
            var context = new SphDataContext();
            foreach (var id in list)
            {
                var contact = await sql.LoadOneAsync(id);
                // TODO : removeAll, doesn seem to work
                contact.Groups.RemoveAll(x => x.Equals(group, StringComparison.InvariantCultureIgnoreCase));
                var nn = contact.Groups.Any(x => x.Equals(newName, StringComparison.InvariantCultureIgnoreCase));
                if (!nn)
                    contact.Groups.Add(newName);

                using (var session = context.OpenSession())
                {
                    session.Attach(contact);
                    await session.SubmitChanges("RenameGroup", new Dictionary<string, object> { { "username", User.Identity.Name } });
                }
            }
            // wait a little until it's processed , max 10 seconds
            for (var i = 0; i < 100; i++)
            {
                await Task.Delay(100);
                var response = await repos.SearchAsync(query, "from=0&size=1");
                var json = JObject.Parse(response);
                rows = json.SelectToken("$.hits.total").Value<int>();
                if (rows == 0) break;
            }
            
            return Ok(new { message = $"{group} has been renamed to {newName}, there are {list.Count} changes made" });

        }

        [HttpPost]
        [Route("groups/{group}/{id:guid}")]
        public async Task<IHttpActionResult> AddContactToGroup(string id, string group)
        {
            var repos = ObjectBuilder.GetObject<IRepository<AddressBook>>();
            var context = new SphDataContext();

            var contact = await repos.LoadOneAsync(id);
            if (null == contact) return NotFound($"Contact with Id {id} is not found");
            if (contact.Groups.Contains(group))
                return Ok(new { message = $"{contact.CompanyName} is already in {group}" });

            contact.Groups.Add(group);
            using (var session = context.OpenSession())
            {
                session.Attach(contact);
                await session.SubmitChanges("AddGroup", new Dictionary<string, object> { { "username", User.Identity.Name } });
            }

            return Ok(new { message = $"{contact.CompanyName} has been added to {group}" });

        }

        [HttpPost]
        [Route("{storeId:guid}")]
        public async Task<IHttpActionResult> ImportContacts(string storeId)
        {
            var store = ObjectBuilder.GetObject<IBinaryStore>();
            var csv = await store.GetContentAsync(storeId);
            if (null == csv)
                return NotFound($"Cannot outlook csv in {storeId}");

            // write code use mapping , from port to import the data
            var port = new Bespoke.Ost.ReceivePorts.OutlookCsvContact(ObjectBuilder.GetObject<ILogger>());
            var map = new Bespoke.Ost.Integrations.Transforms.OutlookContactToAddressBook();

            var text = Encoding.Default.GetString(csv.Content);
            var lines = from t in text.Split(new[] { "\r\n", "\r" }, StringSplitOptions.RemoveEmptyEntries)
                        where !t.StartsWith("First Name,") // ignore the label
                        let fields = t.Split(new[] { "," }, StringSplitOptions.None).Take(88)
                        select string.Join(",", fields);


            // TODO :the mapping could have been simpler, if we the source is just the port type
            var outlookContacts = from cl in port.Process(lines)
                                  where null != cl
                                  select cl.ToJson().DeserializeFromJson<Bespoke.Ost.OutlookContacts.Domain.OutlookContact>();

            var errors = new List<object>();
            var context = new SphDataContext();
            foreach (var t in outlookContacts)
            {
                try
                {
                    var contact = await map.TransformAsync(t);
                    contact.Id = Guid.NewGuid().ToString();
                    using (var session = context.OpenSession())
                    {
                        session.Attach(contact);
                        await session.SubmitChanges("ImportContacts", new Dictionary<string, object> { { "username", User.Identity.Name } });
                    }
                }
                catch (Exception e)
                {
                    errors.Add(new { message = e.Message, contact = t });
                }

            }

            return Ok(new { errors });
        }

        [HttpGet]
        [Route("group-options")]
        public async Task<IHttpActionResult> GetGroupOptions([FromUri(Name = "count")]bool withCount = false)
        {

            var repos = ObjectBuilder.GetObject<IReadonlyRepository<AddressBook>>();
            var query = $@"
{{
   ""query"": {{
      ""term"": {{
         ""CreatedBy"": {{
            ""value"": ""{User.Identity.Name}""
         }}
      }}
   }},
   ""aggs"": {{
      ""groups"": {{
         ""terms"": {{
            ""field"": ""Groups""
         }}
      }}
   }},
   ""size"": 0
}}";


            var response = await repos.SearchAsync(query);
            var json = JObject.Parse(response);
            var buckets = json.SelectToken("$.aggregations.groups.buckets");

            if (withCount)
            {
                var groups = from b in buckets
                             select new { @group = b.SelectToken("key").Value<string>(), count = b.SelectToken("doc_count").Value<string>() };
                return Ok(groups);
            }
            var keys = buckets.Select(b => b.SelectToken("key").Value<string>()).ToList();

            if (keys.Count == 0)
                keys.AddRange(new[] { "Customers", "Gold", "Silver", "Family" });


            return Ok(keys);
        }

        [HttpGet]
        [Route("csv")]
        public async Task<HttpResponseMessage> DownloadCsv(
        [FromUri(Name = "contactName")] bool contactName = true,
        [FromUri(Name = "contactPerson")]bool contactPerson = true,
        [FromUri(Name = "premiseNoMailbox")]bool premiseNoMailbox = true,
        [FromUri(Name = "block")]bool block = true,
        [FromUri(Name = "buildingName")]bool buildingName = true,
        [FromUri(Name = "roadName")]bool roadNam = true,
        [FromUri(Name = "areaVillage")]bool areaVillage = true,
        [FromUri(Name = "subDistrict")]bool subDistrict = true,
        [FromUri(Name = "districtCity")]bool districtCity = true,
        [FromUri(Name = "state")]bool state = true,
        [FromUri(Name = "country")]bool country = true,
        [FromUri(Name = "phoneNo")]bool phoneNo = true,
        [FromUri(Name = "faxNumber")]bool faxNumber = true,
        [FromUri(Name = "email")]bool email = true,
        [FromUri(Name = "gpsLocation")]bool gpsLocation = false,
        [FromUri(Name = "referenceNo")]bool referenceNo = true,
        [FromUri(Name = "addressGroup")]bool addressGroup = false)
        {

            var list = new List<AddressBook>();
            var rows = int.MaxValue;
            var page = 0;
            const int size = 50;
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<AddressBook>>();
            var query = $@"{{
   ""query"": {{
       ""term"": {{
          ""CreatedBy"": {{
             ""value"": ""{User.Identity.Name}""
          }}
       }}
   }}
}}";
            while (list.Count < rows)
            {
                page++;

                var queryString = $"from={size * (page - 1)}&size={size}";

                var response = await repos.SearchAsync(query, queryString);
                var json = JObject.Parse(response);
                var addresses = from f in json.SelectToken("$.hits.hits")
                                select f.SelectToken("_source").ToString().DeserializeFromJson<AddressBook>();



                list.AddRange(addresses);
                rows = json.SelectToken("$.hits.total").Value<int>();
            }
            var csv = new StringBuilder();

            // headers
            if (contactName)
                csv.Append(@"""contactName"",");
            if (contactPerson)
                csv.Append(@"""ContactPerson"",");
            if (premiseNoMailbox)
                csv.Append(@"""Address.PremiseNoMailbox"",");
            if (block)
                csv.Append(@"""Address.Block"",");
            if (buildingName)
                csv.Append(@"""Address.BuildingName"",");
            if (roadNam)
                csv.Append(@"""Address.RoadName"",");
            if (areaVillage)
                csv.Append(@"""Address.AreaVillageGardenName"",");
            if (subDistrict)
                csv.Append(@"""Address.SubDistrict"",");
            if (districtCity)
                csv.Append(@"""Address.City"",");
            if (state)
                csv.Append(@"""Address.State"",");
            if (country)
                csv.Append(@"""Address.Country"",");
            if (phoneNo)
                csv.Append(@"""Address.PhoneNumber"",");
            if (faxNumber)
                csv.Append(@"""Address.FaxNumber"",");
            if (email)
                csv.Append(@"""Address.Email"",");
            if (gpsLocation)
                csv.Append($@"""GroupAddress"",");
            if (referenceNo)
                csv.Append(@"""ReferenceNo"",");
            if (addressGroup)
                csv.Append(@"""GroupAddress"",");

            csv.AppendLine();

            foreach (var adr in list)
            {
                if (contactName)
                    csv.Append(@""""",");
                if (contactName)
                    csv.Append($@"""{adr.ContactPerson}"",");
                if (premiseNoMailbox)
                    csv.Append($@"""{adr.Address.PremiseNoMailbox}"",");
                if (block)
                    csv.Append($@"""{adr.Address.Block}"",");
                if (buildingName)
                    csv.Append($@"""{adr.Address.BuildingName}"",");
                if (roadNam)
                    csv.Append($@"""{adr.Address.RoadName}"",");
                if (areaVillage)
                    csv.Append($@"""{adr.Address.AreaVillageGardenName}"",");
                if (subDistrict)
                    csv.Append($@"""{adr.Address.SubDistrict}"",");
                if (districtCity)
                    csv.Append($@"""{adr.Address.City}"",");
                if (state)
                    csv.Append($@"""{adr.Address.State}"",");
                if (country)
                    csv.Append($@"""{adr.Address.Country}"",");
                if (phoneNo)
                    csv.Append($@"""{adr.ContactInformation.PhoneNumber}"",");
                if (faxNumber)
                    csv.Append($@"""{adr.ContactInformation.FaxNumber}"",");
                if (email)
                    csv.Append($@"""{adr.ContactInformation.EmailAddress}"",");
                if (gpsLocation)
                    csv.Append($@"""{adr.Groups}"",");
                if (referenceNo)
                    csv.Append($@"""{adr.ReferenceNo}"",");
                if (addressGroup)
                    csv.Append($@"""{adr.Groups}"",");

                csv.AppendLine();
            }


            var content = Encoding.ASCII.GetBytes(csv.ToString());
            var response2 = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new ByteArrayContent(content)
            };
            response2.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            response2.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = $"contact-list-{DateTime.Today:yy-MM-dd}.csv"
            };
            return response2;
        }
    }


}