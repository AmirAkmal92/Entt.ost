using Bespoke.Ost.AddressBooks.Domain;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using Newtonsoft.Json.Linq;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

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
        [Route("import-contacts/{storeId:guid}")]
        public async Task<IHttpActionResult> ImportContacts(string storeId)
        {
            var errors = new List<object>();
            var context = new SphDataContext();

            var store = ObjectBuilder.GetObject<IBinaryStore>();
            var doc = await store.GetContentAsync(storeId);
            if (null == doc) return Ok(new { success = false, status = $"Cannot find file in {storeId}." });

            var temp = Path.GetTempFileName() + ".xlsx";
            System.IO.File.WriteAllBytes(temp, doc.Content);

            var file = new FileInfo(temp);
            var excel = new ExcelPackage(file);
            var ws = excel.Workbook.Worksheets["Addresses"];
            if (null == ws) return Ok(new { success = false, status = $"Cannot open Worksheet Addresses in {doc.FileName}." });

            var row = 2;
            var countAddedAddressBook = 0;
            var name = ws.Cells[$"A{row}"].GetValue<string>();
            var email = ws.Cells[$"B{row}"].GetValue<string>();
            var postcode = ws.Cells[$"L{row}"].GetValue<string>();
            var hasRow = !string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(email) && !string.IsNullOrEmpty(postcode);

            while (hasRow)
            {
                var contact = new AddressBook();
                contact.Id = Guid.NewGuid().ToString();
                contact.ReferenceNo = email;
                contact.CompanyName = ws.Cells[$"M{row}"].GetValue<string>();
                contact.ContactPerson = name;
                contact.ContactInformation.Email = email;
                contact.ContactInformation.ContactNumber = ws.Cells[$"C{row}"].GetValue<string>();
                contact.ContactInformation.AlternativeContactNumber = ws.Cells[$"D{row}"].GetValue<string>();
                contact.Address.Address1 = ws.Cells[$"E{row}"].GetValue<string>();
                contact.Address.Address2 = ws.Cells[$"F{row}"].GetValue<string>();
                contact.Address.Address3 = ws.Cells[$"G{row}"].GetValue<string>();
                contact.Address.Address4 = ws.Cells[$"H{row}"].GetValue<string>();
                contact.Address.City = ws.Cells[$"I{row}"].GetValue<string>();
                contact.Address.State = ws.Cells[$"J{row}"].GetValue<string>();
                contact.Address.Country = ws.Cells[$"K{row}"].GetValue<string>();
                contact.Address.Postcode = postcode;
                contact.UserId = User.Identity.Name;

                row++;
                name = ws.Cells[$"A{row}"].GetValue<string>();
                email = ws.Cells[$"B{row}"].GetValue<string>();
                postcode = ws.Cells[$"L{row}"].GetValue<string>();
                hasRow = !string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(email) && !string.IsNullOrEmpty(postcode);

                try
                {
                    using (var session = context.OpenSession())
                    {
                        session.Attach(contact);
                        await session.SubmitChanges("ImportContacts", new Dictionary<string, object> { { "username", User.Identity.Name } });
                    }
                }
                catch (Exception e)
                {
                    errors.Add(new { message = e.Message, contact = contact });
                }

                countAddedAddressBook += 1;
            }

            await store.DeleteAsync(storeId);

            if (errors.Count > 0)
                return Ok(new { success = false, status = "Some errors happened." });

            // wait until the worker process it
            await Task.Delay(1500);
            return Ok(new { success = true, status = $"{countAddedAddressBook} contact(s) added." });
        }

        [HttpGet]
        [Route("export-contacts")]
        public async Task<IHttpActionResult> ExportContacts()
        {
            var temp = Path.GetTempFileName() + ".xlsx";
            System.IO.File.Copy(System.Web.HttpContext.Current.Server.MapPath("~/Content/Files/address_format_template.xlsx"), temp, true);

            var file = new FileInfo(temp);
            var excel = new ExcelPackage(file);
            var ws = excel.Workbook.Worksheets["Addresses"];
            if (null == ws) return Ok(new { success = false, status = $"Cannot open Worksheet Addresses" });

            var contacts = new List<AddressBook>();
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
            while (contacts.Count < rows)
            {
                page++;

                var queryString = $"from={size * (page - 1)}&size={size}";

                var response = await repos.SearchAsync(query, queryString);
                var json = JObject.Parse(response);
                var addresses = from f in json.SelectToken("$.hits.hits")
                                select f.SelectToken("_source").ToString().DeserializeFromJson<AddressBook>();

                contacts.AddRange(addresses);
                rows = json.SelectToken("$.hits.total").Value<int>();
            }

            var existingLinesInTemplate = 2;
            var row = 2;

            //Empty existing lines in template
            if (contacts.Count < 2)
            {
                for (var i = 0; i < existingLinesInTemplate; i++)
                {
                    ws.Cells[row + i, 1].Value = string.Empty;
                    ws.Cells[row + i, 2].Value = string.Empty;
                    ws.Cells[row + i, 3].Value = string.Empty;
                    ws.Cells[row + i, 4].Value = string.Empty;
                    ws.Cells[row + i, 5].Value = string.Empty;
                    ws.Cells[row + i, 6].Value = string.Empty;
                    ws.Cells[row + i, 7].Value = string.Empty;
                    ws.Cells[row + i, 8].Value = string.Empty;
                    ws.Cells[row + i, 9].Value = string.Empty;
                    ws.Cells[row + i, 10].Value = string.Empty;
                    ws.Cells[row + i, 11].Value = string.Empty;
                    ws.Cells[row + i, 12].Value = string.Empty;
                    ws.Cells[row + i, 13].Value = string.Empty;
                }
            }

            foreach (var contact in contacts)
            {
                ws.Cells[row, 1].Value = contact.ContactPerson;
                ws.Cells[row, 2].Value = contact.ContactInformation.Email;
                ws.Cells[row, 3].Value = contact.ContactInformation.ContactNumber;
                ws.Cells[row, 4].Value = contact.ContactInformation.AlternativeContactNumber;
                ws.Cells[row, 5].Value = contact.Address.Address1;
                ws.Cells[row, 6].Value = contact.Address.Address2;
                ws.Cells[row, 7].Value = contact.Address.Address3;
                ws.Cells[row, 8].Value = contact.Address.Address4;
                ws.Cells[row, 9].Value = contact.Address.City;
                ws.Cells[row, 10].Value = contact.Address.State;
                ws.Cells[row, 11].Value = contact.Address.Country;
                ws.Cells[row, 12].Value = contact.Address.Postcode;
                ws.Cells[row, 13].Value = contact.CompanyName;
                row++;
            }

            excel.Save();
            excel.Dispose();

            return Json(new { success = true, status = "OK", path = Path.GetFileName(temp) });
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
    }
}