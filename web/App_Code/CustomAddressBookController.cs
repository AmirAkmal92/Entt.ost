using System;
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
            // wait until the worker process it
            await Task.Delay(1000);
            return Ok(new { message = $"{contact.CompanyName} has been added to {group}" });

        }

        [HttpPost]
        [Route("{storeId:guid}")]
        public async Task<IHttpActionResult> ImportContacts(string storeId)
        {
            var store = ObjectBuilder.GetObject<IBinaryStore>();
            var csv = await store.GetContentAsync(storeId);
            if (null == csv) return NotFound($"Cannot find csv in {storeId}");

            // write code use mapping , from port to import the data
            var port = new Bespoke.Ost.ReceivePorts.AddressTemplateFormat(ObjectBuilder.GetObject<ILogger>());
            var map = new Bespoke.Ost.Integrations.Transforms.AddressFormatTemplateToAddressBook();

            var text = Encoding.Default.GetString(csv.Content);
            var lines = from t in text.Split(new[] { "\r\n", "\r" }, StringSplitOptions.RemoveEmptyEntries)
                        where !t.StartsWith("Name,") // ignore the label
                        let fields = t.Split(new[] { "," }, StringSplitOptions.None).Take(88)
                        select string.Join(",", fields);


            // TODO :the mapping could have been simpler, if we the source is just the port type
            var outlookContacts = from cl in port.Process(lines)
                                  where null != cl
                                  select cl.ToJson().DeserializeFromJson<Bespoke.Ost.AddressFormats.Domain.AddressFormat>();

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

            await store.DeleteAsync(storeId);

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
                var groups = buckets.Select(b =>
                             new
                             {
                                 @group = b.SelectToken("key").Value<string>(),
                                 count = b.SelectToken("doc_count").Value<string>()
                             }).OrderBy(x => x.group).ToList();

                return Ok(groups);
            }
            var keys = buckets.Select(b => b.SelectToken("key").Value<string>()).ToList();

            if (keys.Count == 0)
                keys.AddRange(new[] { "Sender", "Receiver" });


            return Ok(keys);
        }

        [HttpGet]
        [Route("csv")]
        public async Task<HttpResponseMessage> DownloadCsv(
        [FromUri(Name = "contactPerson")]bool contactPerson = true,
        [FromUri(Name = "email")]bool email = true,
        [FromUri(Name = "contactNumber")]bool contactNumber = true,
        [FromUri(Name = "altContactNumber")]bool altContactNumber = true,
        [FromUri(Name = "address1")]bool address1 = true,
        [FromUri(Name = "address2")]bool address2 = true,
        [FromUri(Name = "address3")]bool address3 = true,
        [FromUri(Name = "address4")]bool address4 = true,
        [FromUri(Name = "city")]bool city = true,
        [FromUri(Name = "state")]bool state = true,
        [FromUri(Name = "country")]bool country = true,
        [FromUri(Name = "postcode")]bool postcode = true,
        [FromUri(Name = "gpsLocation")]bool gpsLocation = false,
        [FromUri(Name = "addressGroup")]bool addressGroup = false,
        [FromUri(Name = "companyName")] bool companyName = true)
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
            if (contactPerson)
                csv.Append(@"Name,");
            if (email)
                csv.Append(@"Email,");
            if (contactNumber)
                csv.Append(@"Mobile Number,");
               csv.Append(@"Country Code,");
            if (altContactNumber)
                csv.Append(@"Alternative Contact Number,");
            if (address1)
                csv.Append(@"Address Line 1,");
            if (address2)
                csv.Append(@"Address Line 2,");
            if (address3)
                csv.Append(@"Address Line 3,");
            if (address4)
                csv.Append(@"Address Line 4,");
            if (city)
                csv.Append(@"Town,");
            if (state)
                csv.Append(@"State,");
            if (country)
                csv.Append(@"Country,");
            if (postcode)
                csv.Append(@"Postcode,");
               csv.Append(@"Designation,");
            if (companyName)
                csv.Append(@"Company");

            csv.AppendLine();

            foreach (var adr in list)
            {
               
                if (contactPerson)
                    csv.Append($@"{adr.ContactPerson},");
                if (email)
                    csv.Append($@"{adr.ContactInformation.Email},");
                if (contactNumber)
                    csv.Append($@"{adr.ContactInformation.ContactNumber},");
                    csv.Append($@"60-Malaysia,");
                if (altContactNumber)
                    csv.Append($@"{adr.ContactInformation.AlternativeContactNumber},");
                if (address1)
                    csv.Append($@"{adr.Address.Address1},");
                if (address2)
                    csv.Append($@"{adr.Address.Address2},");
                if (address3)
                    csv.Append($@"{adr.Address.Address3},");
                if (address4)
                    csv.Append($@"{adr.Address.Address4},");
                if (city)
                    csv.Append($@"{adr.Address.City},");
                if (state)
                    csv.Append($@"{adr.Address.State},");
                if (country)
                    csv.Append($@"{adr.Address.Country},");
                if (postcode)
                    csv.Append($@"{adr.Address.Postcode},");
                    csv.Append($@"No,");
                if (companyName)
                    csv.Append($@"{adr.CompanyName}");

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