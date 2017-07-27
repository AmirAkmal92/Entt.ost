using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Ost.PosLajuBranchBranches.Domain;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using Newtonsoft.Json.Linq;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace web.sph.App_Code
{
    [RoutePrefix("consignment-request")]
    public class CustomConsignmentRequestController : BaseApiController
    {
        private string m_applicationName;
        private string m_sdsBaseUrl;
        private string m_sdsApi_GenerateConnote;
        private string m_sdsSecretKey_GenerateConnote;
        private string m_sdsApi_PickupWebApi;
        private string m_sdsSecretKey_PickupWebApi;

        public CustomConsignmentRequestController()
        {
            m_applicationName = ConfigurationManager.GetEnvironmentVariable("ApplicationName") ?? "OST";
            m_sdsBaseUrl = ConfigurationManager.GetEnvironmentVariable("SdsBaseUrl") ?? "https://apis.pos.com.my";

            m_sdsApi_GenerateConnote = ConfigurationManager.GetEnvironmentVariable("SdsApi_GenerateConnote") ?? "apigateway/as01/api/genconnote/v1";
            m_sdsSecretKey_GenerateConnote = ConfigurationManager.GetEnvironmentVariable("SdsSecretKey_GenerateConnote") ?? "MjkzYjA5YmItZjMyMS00YzNmLWFmODktYTc2ZTAxMDgzY2Mz";
            m_sdsApi_PickupWebApi = ConfigurationManager.GetEnvironmentVariable("SdsApi_PickupWebApi") ?? "apigateway/as2poslaju/api/pickupwebapi/v1";
            m_sdsSecretKey_PickupWebApi = ConfigurationManager.GetEnvironmentVariable("SdsSecretKey_PickupWebApi") ?? "Nzc1OTk0OTktYzYyNC00MzhhLTk5OTAtYTc2ZTAxMGJiYmMz";
        }

        [HttpPut]
        [Route("calculate-total-price/{id}")]
        public async Task<IHttpActionResult> CalculateAndSaveTotalPrice(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var item = lo.Source;

            // calculate total price
            decimal total = 0;
            foreach (var consignment in lo.Source.Consignments)
            {
                total += consignment.Produk.Price;
            }
            if (!item.Pickup.DateReady.Equals(DateTime.MinValue)
                && !item.Pickup.DateClose.Equals(DateTime.MinValue))
            {
                total += 5.30m;
            }
            item.Payment.TotalPrice = total;

            item.ReferenceNo = GenerateCustomRefNo(item);
            await SaveConsigmentRequest(item);

            var result = new
            {
                success = true,
                status = "OK",
                id = item.Id
            };

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpPut]
        [Route("generate-con-notes/{id}")]
        public async Task<IHttpActionResult> GenerateAndSaveConNotes(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var resultSuccess = true;
            var resultStatus = "OK";
            var item = lo.Source;

            var totalConsignments = item.Consignments.Count;

            if (item.Payment.IsPaid)
            {
                if (!item.Payment.IsConNoteReady)
                {
                    if (totalConsignments > 0)
                    {
                        var client = new HttpClient();
                        client.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_GenerateConnote);
                        var url = new StringBuilder();
                        url.Append(m_sdsApi_GenerateConnote);
                        url.Append("?Prefix=EU");
                        url.Append("&ApplicationCode=OST");
                        url.Append("&Secretid=ost@1234");
                        url.Append("&username=entt.ost");
                        url.Append($"&numberOfItem={totalConsignments.ToString()}");
                        url.Append($"&Orderid={item.Id}");

                        var output = await client.GetStringAsync($"{m_sdsBaseUrl}/{url.ToString()}");

                        var json = JObject.Parse(output);
                        var sdsConnote = new SdsConnote(json);

                        if (sdsConnote.StatusCode == "01")
                        {
                            if (sdsConnote.ConnoteNumbers.Count >= totalConsignments)
                            {
                                for (int i = 0; i < totalConsignments; i++)
                                {
                                    item.Consignments[i].ConNote = sdsConnote.ConnoteNumbers[i];
                                }
                                item.Payment.IsConNoteReady = true;
                                await SaveConsigmentRequest(item);
                            }
                            else
                            {
                                resultSuccess = false;
                                resultStatus = "Generated consignment note not enough";
                            }
                        }
                        else
                        {
                            resultSuccess = false;
                            resultStatus = "StatusCode: " + sdsConnote.StatusCode + " Message: " + sdsConnote.Message;
                        }
                    }
                    else
                    {
                        resultSuccess = false;
                        resultStatus = "Consignment not found";

                    }
                }
                else
                {
                    resultSuccess = false;
                    resultStatus = "Consignment note was already generated";
                }
            }
            else
            {
                resultSuccess = false;
                resultStatus = "Consignment Request has not been paid";
            }

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = item.Id
            };

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpPut]
        [Route("generate-con-notes-est/{id}")]
        public async Task<IHttpActionResult> GenerateAndSaveConNotesEst(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var resultSuccess = true;
            var resultStatus = "OK";
            var item = lo.Source;
            var totalEmptyConNote = 0;
            var totalConsignments = item.Consignments.Count;
            var orderId = item.ReferenceNo;

            Guid guidResult = Guid.Parse(id);
            bool isValid = Guid.TryParse(item.ReferenceNo, out guidResult);

            item.GenerateConnoteCounter += 1;

            if (isValid || !item.ReferenceNo.Contains(m_applicationName.ToUpper()))
            {
                var referenceNo = new StringBuilder();
                referenceNo.Append(GenerateCustomRefNo(item));
                orderId = referenceNo.ToString();
                item.ReferenceNo = referenceNo.ToString();
            }
            else
            {
                orderId = orderId + item.GenerateConnoteCounter.ToString();
            }

            foreach (var a in item.Consignments)
            {
                if (a.ConNote == null && a.Penerima.Address.Postcode != null && a.Produk.Weight > 0)
                {
                    totalEmptyConNote++;
                }
            }

            if (totalEmptyConNote > 0)
            {
                var client = new HttpClient();
                client.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_GenerateConnote);
                var url = new StringBuilder();
                url.Append(m_sdsApi_GenerateConnote);
                url.Append("?Prefix=EU");
                url.Append("&ApplicationCode=OST");
                url.Append("&Secretid=ost@1234");
                url.Append("&username=entt.ost");
                url.Append($"&numberOfItem={totalEmptyConNote.ToString()}");
                url.Append($"&Orderid={orderId}");

                var output = await client.GetStringAsync($"{m_sdsBaseUrl}/{url.ToString()}");

                var json = JObject.Parse(output);
                var sdsConnote = new SdsConnote(json);
                var countSdsConnote = 0;

                if (sdsConnote.StatusCode == "01")
                {
                    if (sdsConnote.ConnoteNumbers.Count >= totalEmptyConNote)
                    {
                        for (int i = 0; i < totalConsignments; i++)
                        {
                            if (item.Consignments[i].ConNote == null && item.Consignments[i].Produk.Weight > 0 && item.Consignments[i].Penerima.Address.Postcode != null)
                            {
                                item.Consignments[i].ConNote = sdsConnote.ConnoteNumbers[countSdsConnote];
                                countSdsConnote += 1;
                            }
                        }
                        item.Payment.IsConNoteReady = true;
                        await SaveConsigmentRequest(item);
                    }
                    else
                    {
                        resultSuccess = false;
                        resultStatus = "Generated consignment note not enough";
                    }
                }
                else
                {
                    resultSuccess = false;
                    resultStatus = "StatusCode: " + sdsConnote.StatusCode + " Message: " + sdsConnote.Message;
                }
            }
            else
            {
                resultSuccess = false;
                resultStatus = "All Consignment note was already generated";
            }

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = item.Id
            };

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpGet]
        [Route("get-pickup-availability/{postcode}")]
        public async Task<IHttpActionResult> GetPickupAvailability(int postcode)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<PosLajuBranch>>();
            var query = $@"{{
  ""filter"": {{
    ""bool"": {{
      ""must"": [

      ],
      ""must_not"": [

      ]
    }}
  }},
  ""sort"": [ {{ ""PostcodeFrom"": {{ ""order"": ""asc"" }} }} ],
  ""aggs"": {{
    ""filtered_max_date"": {{
      ""filter"": {{
        ""bool"": {{
          ""must"": [

          ],
          ""must_not"": [

          ]
        }}
      }},
      ""aggs"": {{
        ""last_changed_date"": {{
          ""max"": {{
            ""field"": ""ChangedDate""
          }}
        }}
      }}
    }}
  }}
}}";
            var queryString = "from=0&size=200";
            var response = await repos.SearchAsync(query, queryString);
            var json = JObject.Parse(response);

            var list = from f in json.SelectToken("$.hits.hits")
                       let webId = f.SelectToken("_source.WebId").Value<string>()
                       let id = f.SelectToken("_id").Value<string>()
                       let link = $"\"link\" :{{ \"href\" :\"{ConfigurationManager.BaseUrl}/api/pos-laju-branches/{id}\"}}"
                       select f.SelectToken("_source").ToString().Replace($"{webId}\"", $"{webId}\"," + link);

            var posLajuBranches = list.ToList();
            List<PosLajuBranch> branches = new List<PosLajuBranch>();

            foreach (var posLajuBranch in posLajuBranches)
            {
                JObject jObject = JObject.Parse(posLajuBranch);
                var tmpBranch = new PosLajuBranch
                {
                    BranchCode = (string)jObject["BranchCode"],
                    Name = (string)jObject["Name"],
                    PostcodeFrom = (string)jObject["PostcodeFrom"],
                    PostcodeTo = (string)jObject["PostcodeTo"],
                    Email = (string)jObject["Email"],
                    PickupId = (string)jObject["PickupId"],
                    AllowPickup = (bool)jObject["AllowPickup"],
                    CreatedBy = (string)jObject["CreatedBy"],
                    Id = (string)jObject["Id"],
                    CreatedDate = (DateTime)jObject["CreatedDate"],
                    ChangedBy = (string)jObject["ChangedBy"],
                    ChangedDate = (DateTime)jObject["ChangedDate"],
                    WebId = (string)jObject["WebId"]
                };

                branches.Add(tmpBranch);
            }

            var branch = branches.Where(x => postcode >= int.Parse(x.PostcodeFrom)
                && postcode <= int.Parse(x.PostcodeTo)
                && x.AllowPickup.Equals(true))
            .FirstOrDefault();

            if (branch == null)
            {
                return NotFound("No pickup for postcode: " + postcode);
            }

            return Ok(branch);
        }

        [HttpPut]
        [Route("propose-pickup/{id}")]
        public async Task<IHttpActionResult> ProposePickup(string id,
            [FromUri(Name = "timeReady")]string timeReady = "12:00 PM",
            [FromUri(Name = "timeClose")]string timeClose = "06:30 PM")
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var resultSuccess = true;
            var resultStatus = "OK";
            var item = lo.Source;

            if (!item.Payment.IsPaid)
            {
                if (string.IsNullOrEmpty(item.Pickup.Number))
                {
                    if (!string.IsNullOrEmpty(item.Pickup.Address.Postcode))
                    {
                        DateTime tReady = DateTime.ParseExact(timeReady, "hh:mm tt",
                           CultureInfo.InvariantCulture);
                        DateTime tClose = DateTime.ParseExact(timeClose, "hh:mm tt",
                                                            CultureInfo.InvariantCulture);
                        var totalConsignments = item.Consignments.Count;
                        decimal totalWeight = 0;
                        foreach (var consignment in item.Consignments)
                        {
                            totalWeight += consignment.Produk.Weight;
                        }

                        item.Pickup.DateReady = tReady;
                        item.Pickup.DateClose = tClose;
                        item.Pickup.TotalDocument = 0;
                        item.Pickup.TotalMerchandise = 0;
                        item.Pickup.TotalParcel = totalConsignments;
                        item.Pickup.TotalQuantity = totalConsignments;
                        item.Pickup.TotalWeight = totalWeight;
                        await SaveConsigmentRequest(item);
                    }
                    else
                    {
                        resultSuccess = false;
                        resultStatus = "Postcode is mandatory";
                    }
                }
                else
                {
                    resultSuccess = false;
                    resultStatus = "Pickup was already scheduled";
                }
            }
            else
            {
                resultSuccess = false;
                resultStatus = "Consignment Request has been paid";
            }

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = item.Id,
                pickup_ready = item.Pickup.DateReady.ToString(),
                pickup_close = item.Pickup.DateClose.ToString()
            };

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpPut]
        [Route("renew-pickup/{id}")]
        public async Task<IHttpActionResult> RenewPickup(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var item = lo.Source;

            item.Pickup.DateReady = DateTime.MinValue;
            item.Pickup.DateClose = DateTime.MinValue;
            item.Pickup.Number = null;
            item.Pickup.TotalParcel = 0;
            item.Pickup.TotalQuantity = 0;
            item.Pickup.TotalWeight = 0;
            item.Payment.IsPickupScheduled = false;

            await SaveConsigmentRequest(item);

            var result = new
            {
                success = true,
                status = "OK",
                id = item.Id
            };

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpPut]
        [Route("schedule-pickup/{id}")]
        public async Task<IHttpActionResult> ScheduleAndSavePickup(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var resultSuccess = true;
            var resultStatus = "OK";
            var item = lo.Source;

            UserProfile userProfile = await GetDesignation();

            if ((userProfile.Designation == "No contract customer" && item.Payment.IsPaid)
                || (userProfile.Designation == "Contract customer" && !item.Payment.IsPaid))
            {
                if (!item.Payment.IsPickupScheduled)
                {
                    if (!string.IsNullOrEmpty(item.Pickup.Address.Postcode))
                    {
                        var client = new HttpClient();
                        client.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_PickupWebApi);
                        var url = new StringBuilder();
                        url.Append(m_sdsApi_PickupWebApi);
                        url.Append($"?callerNameF={item.Pickup.ContactPerson}");
                        url.Append($"&contactpersonf={item.Pickup.ContactPerson}");
                        url.Append($"&phoneNoF={item.Pickup.ContactInformation.ContactNumber}");
                        url.Append($"&callerPhoneF={item.Pickup.ContactInformation.ContactNumber}");
                        url.Append($"&pickAddressF={item.Pickup.Address.Address1}");
                        url.Append($" {item.Pickup.Address.Address2}");
                        url.Append($", {item.Pickup.Address.Address3}");
                        url.Append($" {item.Pickup.Address.Address4}");
                        url.Append($", {item.Pickup.Address.Postcode}");
                        url.Append($" {item.Pickup.Address.City}");
                        url.Append($", {item.Pickup.Address.State}");
                        url.Append($" {item.Pickup.Address.Country}");
                        url.Append($"&posCodeF={item.Pickup.Address.Postcode}");
                        url.Append("&totDocumentF=0");
                        url.Append("&totMerchandiseF=0");
                        url.Append($"&totParcelF={item.Pickup.TotalParcel}");
                        url.Append($"&totQuantityF={item.Pickup.TotalQuantity}");
                        url.Append($"&totWeightF={item.Pickup.TotalWeight}");
                        url.Append($"&accNoF=ENTT-OST-{item.Id}");
                        string timeReady = item.Pickup.DateReady.ToShortTimeString();
                        timeReady = SanitizeShortTimeString(timeReady);
                        string timeClose = item.Pickup.DateClose.ToShortTimeString();
                        timeClose = SanitizeShortTimeString(timeClose);
                        url.Append($"&_readyF={timeReady}");
                        url.Append($"&_closeF={timeClose}");

                        var output = await client.GetStringAsync($"{m_sdsBaseUrl}/{url.ToString()}");

                        var json = JObject.Parse(output);
                        var sdsPickup = new SdsPickup(json);

                        if (sdsPickup.StatusCode == "00")
                        {
                            DateTime currentTime = DateTime.Now;
                            DateTime cutOffTime = DateTime.ParseExact("12:00 PM", "hh:mm tt",
                                        CultureInfo.InvariantCulture);
                            DateTime tReady = DateTime.ParseExact(timeReady, "hh:mm tt",
                                                       CultureInfo.InvariantCulture);
                            DateTime tClose = DateTime.ParseExact(timeClose, "hh:mm tt",
                                                                CultureInfo.InvariantCulture);

                            if (currentTime < cutOffTime)
                            {
                                item.Pickup.DateReady = tReady;
                                item.Pickup.DateClose = tClose;
                            }
                            else
                            {
                                item.Pickup.DateReady = tReady.AddDays(1);
                                item.Pickup.DateClose = tClose.AddDays(1);
                            }
                            item.Pickup.Number = sdsPickup.PickupNumber;
                            item.Pickup.TotalDocument = 0;
                            item.Pickup.TotalMerchandise = 0;
                            item.Pickup.TotalParcel = item.Pickup.TotalParcel;
                            item.Pickup.TotalQuantity = item.Pickup.TotalQuantity;
                            item.Pickup.TotalWeight = item.Pickup.TotalWeight;
                            item.Payment.IsPickupScheduled = true;
                            await SaveConsigmentRequest(item);
                        }
                        else
                        {
                            resultSuccess = false;
                            resultStatus = "Message: " + json["Message"].ToString();
                        }
                    }
                    else
                    {
                        resultSuccess = false;
                        resultStatus = "Postcode is mandatory";
                    }
                }
                else
                {
                    resultSuccess = false;
                    resultStatus = "Pickup was already scheduled";
                }
            }
            else
            {
                resultSuccess = false;
                resultStatus = "Consignment Request has not been paid";
            }

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = item.Id,
                pickup_number = item.Pickup.Number,
                pickup_ready = item.Pickup.DateReady.ToString(),
                pickup_close = item.Pickup.DateClose.ToString()
            };

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpPost]
        [Route("import-consignments/{consignmentId:guid}/store-id/{storeId:guid}")]
        public async Task<IHttpActionResult> ImportConsignments(string consignmentId, string storeId)
        {
            var store = ObjectBuilder.GetObject<IBinaryStore>();
            var doc = await store.GetContentAsync(storeId);
            if (null == doc) return NotFound($"Cannot find file in {storeId}");

            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(consignmentId);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + consignmentId);

            var resultSuccess = true;
            var resultStatus = "OK";
            var item = lo.Source;

            if (!item.Payment.IsPaid)
            {
                var temp = Path.GetTempFileName() + ".xlsx";
                System.IO.File.WriteAllBytes(temp, doc.Content);

                var file = new FileInfo(temp);
                var excel = new ExcelPackage(file);
                var ws = excel.Workbook.Worksheets["Consignments"];
                if (null != ws)
                {
                    var row = 2;
                    var senderPostcode = ws.Cells[$"M{row}"].GetValue<string>();
                    var receiverPostcode = ws.Cells[$"Z{row}"].GetValue<string>();
                    var productWeigth = ws.Cells[$"AA{row}"].GetValue<string>();
                    var productWidth = ws.Cells[$"AB{row}"].GetValue<string>();
                    var productLength = ws.Cells[$"AC{row}"].GetValue<string>();
                    var productHeigth = ws.Cells[$"AD{row}"].GetValue<string>();
                    var productDescription = ws.Cells[$"AE{row}"].GetValue<string>();
                    var hasRow = !string.IsNullOrEmpty(senderPostcode) && !string.IsNullOrEmpty(receiverPostcode)
                        && !string.IsNullOrEmpty(productWeigth) && !string.IsNullOrEmpty(productWidth)
                        && !string.IsNullOrEmpty(productLength) && !string.IsNullOrEmpty(productHeigth)
                        && !string.IsNullOrEmpty(productDescription);
                    
                    while (hasRow)
                    {
                        var consignment = new Consignment();

                        consignment.WebId = Guid.NewGuid().ToString();

                        // assign sender information
                        consignment.Pemberi.ContactPerson = ws.Cells[$"A{row}"].GetValue<string>();
                        consignment.Pemberi.CompanyName = ws.Cells[$"B{row}"].GetValue<string>();
                        consignment.Pemberi.ContactInformation.Email = ws.Cells[$"C{row}"].GetValue<string>();
                        consignment.Pemberi.ContactInformation.ContactNumber = ws.Cells[$"D{row}"].GetValue<string>();
                        consignment.Pemberi.ContactInformation.AlternativeContactNumber = ws.Cells[$"E{row}"].GetValue<string>();
                        consignment.Pemberi.Address.Address1 = ws.Cells[$"F{row}"].GetValue<string>();
                        consignment.Pemberi.Address.Address2 = ws.Cells[$"G{row}"].GetValue<string>();
                        consignment.Pemberi.Address.Address3 = ws.Cells[$"H{row}"].GetValue<string>();
                        consignment.Pemberi.Address.Address4 = ws.Cells[$"I{row}"].GetValue<string>();
                        consignment.Pemberi.Address.City = ws.Cells[$"J{row}"].GetValue<string>();
                        consignment.Pemberi.Address.State = ws.Cells[$"K{row}"].GetValue<string>();
                        consignment.Pemberi.Address.Country = ws.Cells[$"L{row}"].GetValue<string>();
                        consignment.Pemberi.Address.Postcode = senderPostcode;

                        // assign receiver information
                        consignment.Penerima.ContactPerson = ws.Cells[$"N{row}"].GetValue<string>();
                        consignment.Penerima.CompanyName = ws.Cells[$"O{row}"].GetValue<string>();
                        consignment.Penerima.ContactInformation.Email = ws.Cells[$"P{row}"].GetValue<string>();
                        consignment.Penerima.ContactInformation.ContactNumber = ws.Cells[$"Q{row}"].GetValue<string>();
                        consignment.Penerima.ContactInformation.AlternativeContactNumber = ws.Cells[$"R{row}"].GetValue<string>();
                        consignment.Penerima.Address.Address1 = ws.Cells[$"S{row}"].GetValue<string>();
                        consignment.Penerima.Address.Address2 = ws.Cells[$"T{row}"].GetValue<string>();
                        consignment.Penerima.Address.Address3 = ws.Cells[$"U{row}"].GetValue<string>();
                        consignment.Penerima.Address.Address4 = ws.Cells[$"V{row}"].GetValue<string>();
                        consignment.Penerima.Address.City = ws.Cells[$"W{row}"].GetValue<string>();
                        consignment.Penerima.Address.State = ws.Cells[$"X{row}"].GetValue<string>();
                        consignment.Penerima.Address.Country = ws.Cells[$"Y{row}"].GetValue<string>();
                        consignment.Penerima.Address.Postcode = ws.Cells[$"Z{row}"].GetValue<string>();

                        // assign product information
                        consignment.Produk.Weight = Convert.ToDecimal(productWeigth, CultureInfo.InvariantCulture);
                        consignment.Produk.Width = Convert.ToDecimal(productWidth, CultureInfo.InvariantCulture);
                        consignment.Produk.Length = Convert.ToDecimal(productLength, CultureInfo.InvariantCulture);
                        consignment.Produk.Height = Convert.ToDecimal(productHeigth, CultureInfo.InvariantCulture);
                        consignment.Produk.Description = productDescription;

                        row++;
                        senderPostcode = ws.Cells[$"M{row}"].GetValue<string>();
                        receiverPostcode = ws.Cells[$"Z{row}"].GetValue<string>();
                        productWeigth = ws.Cells[$"AA{row}"].GetValue<string>();
                        productWidth = ws.Cells[$"AB{row}"].GetValue<string>();
                        productLength = ws.Cells[$"AC{row}"].GetValue<string>();
                        productHeigth = ws.Cells[$"AD{row}"].GetValue<string>();
                        productDescription = ws.Cells[$"AE{row}"].GetValue<string>();
                        hasRow = !string.IsNullOrEmpty(senderPostcode) && !string.IsNullOrEmpty(receiverPostcode)
                           && !string.IsNullOrEmpty(productWeigth) && !string.IsNullOrEmpty(productWidth)
                           && !string.IsNullOrEmpty(productLength) && !string.IsNullOrEmpty(productHeigth)
                           && !string.IsNullOrEmpty(productDescription);

                        item.Consignments.Add(consignment);
                    }

                    try
                    {
                        await SaveConsigmentRequest(item);
                    }
                    catch (Exception e)
                    {
                        resultSuccess = false;
                        resultStatus = $"{e.Message}.";
                    }
                }
                else
                {
                    resultSuccess = false;
                    resultStatus = $"Cannot open Worksheet Consignments in {doc.FileName}.";
                }
            }
            else
            {
                resultSuccess = false;
                resultStatus = "Consignment Request has been paid";
            }

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = item.Id
            };

            await store.DeleteAsync(storeId);

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpPost]
        [Route("export-consignments")]
        public IHttpActionResult ExportConsignments([FromBody]List<Consignment> items)
        {
            var csv = new StringBuilder();

            csv.Append(@"Sender Name,");
            csv.Append(@"Sender Company Name,");
            csv.Append(@"Sender Email,");
            csv.Append(@"Sender Contact Number,");
            csv.Append(@"Sender Alternative Contact Number,");
            csv.Append(@"Sender Address 1,");
            csv.Append(@"Sender Address 2,");
            csv.Append(@"Sender Address 3,");
            csv.Append(@"Sender Address 4,");
            csv.Append(@"Sender City,");
            csv.Append(@"Sender State,");
            csv.Append(@"Sender Country,");
            csv.Append(@"Sender Postcode,");

            csv.Append(@"Receiver Name,");
            csv.Append(@"Receiver Company Name,");
            csv.Append(@"Receiver Email,");
            csv.Append(@"Receiver Contact Number,");
            csv.Append(@"Receiver Alternative Contact Number,");
            csv.Append(@"Receiver Address 1,");
            csv.Append(@"Receiver Address 2,");
            csv.Append(@"Receiver Address 3,");
            csv.Append(@"Receiver Address 4,");
            csv.Append(@"Receiver City,");
            csv.Append(@"Receiver State,");
            csv.Append(@"Receiver Country,");
            csv.Append(@"Receiver Postcode,");

            csv.Append(@"Item Weight kg,");
            csv.Append(@"Item Width cm,");
            csv.Append(@"Item Length cm,");
            csv.Append(@"Item Height cm,");
            csv.Append(@"Item Description");

            csv.AppendLine();

            foreach (var item in items)
            {
                csv.Append($@"{item.Pemberi.ContactPerson},");
                csv.Append($@"{item.Pemberi.CompanyName},");
                csv.Append($@"{item.Pemberi.ContactInformation.Email},");
                csv.Append($@"{item.Pemberi.ContactInformation.ContactNumber},");
                csv.Append($@"{item.Pemberi.ContactInformation.AlternativeContactNumber},");
                csv.Append($@"{item.Pemberi.Address.Address1},");
                csv.Append($@"{item.Pemberi.Address.Address2},");
                csv.Append($@"{item.Pemberi.Address.Address3},");
                csv.Append($@"{item.Pemberi.Address.Address4},");
                csv.Append($@"{item.Pemberi.Address.City},");
                csv.Append($@"{item.Pemberi.Address.State},");
                csv.Append($@"{item.Pemberi.Address.Country},");
                csv.Append($@"{item.Pemberi.Address.Postcode},");

                csv.Append($@"{item.Penerima.ContactPerson},");
                csv.Append($@"{item.Penerima.CompanyName},");
                csv.Append($@"{item.Penerima.ContactInformation.Email},");
                csv.Append($@"{item.Penerima.ContactInformation.ContactNumber},");
                csv.Append($@"{item.Penerima.ContactInformation.AlternativeContactNumber},");
                csv.Append($@"{item.Penerima.Address.Address1},");
                csv.Append($@"{item.Penerima.Address.Address2},");
                csv.Append($@"{item.Penerima.Address.Address3},");
                csv.Append($@"{item.Penerima.Address.Address4},");
                csv.Append($@"{item.Penerima.Address.City},");
                csv.Append($@"{item.Penerima.Address.State},");
                csv.Append($@"{item.Penerima.Address.Country},");
                csv.Append($@"{item.Penerima.Address.Postcode},");

                csv.Append($@"{item.Produk.Weight},");
                csv.Append($@"{item.Produk.Width},");
                csv.Append($@"{item.Produk.Length},");
                csv.Append($@"{item.Produk.Height},");
                csv.Append($@"{item.Produk.Description}");

                csv.AppendLine();
            }

            var response = new
            {
                success = true,
                status = "OK",
                content = csv.ToString()
            };
            return Accepted(response);
        }

        private static async Task<LoadData<ConsigmentRequest>> GetConsigmentRequest(string id)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<ConsigmentRequest>>();
            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("ReferenceNo", id);
            return lo;
        }

        private static async Task SaveConsigmentRequest(ConsigmentRequest item)
        {
            var context = new SphDataContext();
            using (var session = context.OpenSession())
            {
                session.Attach(item);
                await session.SubmitChanges("Default");
            }
        }

        private static string SanitizeShortTimeString(string timeReady)
        {
            var format = timeReady.Split(':');
            if (format[0].Length == 1)
            {
                timeReady = "0" + timeReady;
            }

            return timeReady;
        }

        private string GenerateCustomRefNo(ConsigmentRequest item)
        {
            var referenceNo = new StringBuilder();
            referenceNo.Append($"{m_applicationName.ToUpper()}-");
            referenceNo.Append(DateTime.Now.ToString("ddMMyy-ss-"));
            referenceNo.Append((item.Id.Split('-'))[1]);
            return referenceNo.ToString();
        }

        private async Task<UserProfile> GetDesignation()
        {
            var username = User.Identity.Name;
            var directory = new SphDataContext();
            var userProfile = await directory.LoadOneAsync<UserProfile>(p => p.UserName == username) ?? new UserProfile();
            return userProfile;
        }
    }

    public class SdsConnote
    {
        public SdsConnote(JObject json)
        {
            this.StatusCode = json.SelectToken("$.StatusCode").Value<string>();
            this.ConnoteNumbers = json.SelectToken("$.ConnoteNo").Value<string>().Split('|').ToList();
            this.Message = json.SelectToken("$.Message").Value<string>();

        }

        public string StatusCode { get; set; }
        public List<string> ConnoteNumbers { get; set; }
        public string Message { get; set; }
    }

    public class SdsPickup
    {
        public SdsPickup(JObject json)
        {
            this.StatusCode = json.SelectToken("$.StatusCode").Value<string>();
            this.PickupNumber = json.SelectToken("$.pickupNumber").Value<string>();
            this.Message = (json.SelectToken("$.Message") == null) ? string.Empty : json.SelectToken("$.Message").Value<string>();
        }

        public string StatusCode { get; set; }
        public string PickupNumber { get; set; }
        public string Message { get; set; }
    }
}