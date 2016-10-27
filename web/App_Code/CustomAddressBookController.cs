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
        [HttpPost]
        [Route("{storeId:guid}")]
        public async Task<IHttpActionResult> ImportContacts(string storeId)
        {
            var store = ObjectBuilder.GetObject<IBinaryStore>();
            var csv = await store.GetContentAsync(storeId);

            // write code use mapping , from port to import the data

            return Ok(csv);
        }

        [HttpGet]
        [Route("group-options")]
        public async Task<IHttpActionResult> GetGroupOptions()
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