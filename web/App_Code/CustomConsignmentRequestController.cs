using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Ost.PosLajuBranchBranches.Domain;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
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

            // construct new reference number
            var referenceNo = new StringBuilder();
            referenceNo.Append($"{m_applicationName.ToUpper()}-");
            referenceNo.Append(DateTime.Now.ToString("ddMMyy-ss-"));
            referenceNo.Append((item.Id.Split('-'))[1]);
            item.ReferenceNo = referenceNo.ToString();

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
                        url.Append("?Prefix=ES");
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
                    CreatedBy = (string)jObject["CreatedBy"],
                    Id = (string)jObject["Id"],
                    CreatedDate = (DateTime)jObject["CreatedDate"],
                    ChangedBy = (string)jObject["ChangedBy"],
                    ChangedDate = (DateTime)jObject["ChangedDate"],
                    WebId = (string)jObject["WebId"]
                };

                branches.Add(tmpBranch);
            }

            var branch = branches.Where(x => postcode >= Int32.Parse(x.PostcodeFrom) && postcode <= Int32.Parse(x.PostcodeTo)).FirstOrDefault();

            if (branch == null)
            {
                return NotFound("No pickup for postcode: " + postcode);
            }

            return Ok(branch);
        }

        [HttpPut]
        [Route("propose-pickup/{id}")]
        public async Task<IHttpActionResult> ProposePickup(string id,
            [FromUri(Name = "timeReady")]string timeReady = "02:00 PM",
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
        [Route("schedule-pickup/{id}")]
        public async Task<IHttpActionResult> ScheduleAndSavePickup(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var resultSuccess = true;
            var resultStatus = "OK";
            var item = lo.Source;

            if (item.Payment.IsPaid)
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
                        var totalConsignments = item.Consignments.Count;
                        url.Append($"&totParcelF={totalConsignments}");
                        url.Append($"&totQuantityF={totalConsignments}");
                        decimal totalWeight = 0;
                        foreach (var consignment in item.Consignments)
                        {
                            totalWeight += consignment.Produk.Weight;
                        }                        
                        url.Append($"&totWeightF={totalWeight}");
                        url.Append($"&accNoF=ENTT-OST-{item.Id}");
                        string timeReady = item.Pickup.DateReady.ToShortTimeString();
                        timeReady = sanitizeShortTimeString(timeReady);
                        string timeClose = item.Pickup.DateClose.ToShortTimeString();
                        timeClose = sanitizeShortTimeString(timeClose);
                        url.Append($"&_readyF={timeReady}");
                        url.Append($"&_closeF={timeClose}");

                        var output = await client.GetStringAsync($"{m_sdsBaseUrl}/{url.ToString()}");

                        var json = JObject.Parse(output);
                        var sdsPickup = new SdsPickup(json);

                        if (sdsPickup.StatusCode == "00")
                        {
                            DateTime currentTime = DateTime.Now;
                            DateTime cutOffTime = DateTime.ParseExact("11:00 AM", "hh:mm tt",
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
                            item.Pickup.TotalParcel = totalConsignments;
                            item.Pickup.TotalQuantity = totalConsignments;
                            item.Pickup.TotalWeight = totalWeight;
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
        [Route("import-consignments/{id}/store-id/{storeId}")]
        public async Task<IHttpActionResult> ImportConsignments(string id, string storeId)
        {
            var store = ObjectBuilder.GetObject<IBinaryStore>();
            var csv = await store.GetContentAsync(storeId);
            if (null == csv) return NotFound($"Cannot find csv in {storeId}");

            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var resultSuccess = true;
            var resultStatus = "OK";
            var item = lo.Source;

            if (!item.Payment.IsPaid)
            {
                var port = new Bespoke.Ost.ReceivePorts.ConsignmentListTemplateFormat(ObjectBuilder.GetObject<ILogger>());
                var text = Encoding.Default.GetString(csv.Content);
                var lines = from t in text.Split(new[] { "\r\n", "\r" }, StringSplitOptions.RemoveEmptyEntries)
                            where !t.StartsWith("Sender Name,") // ignore the label
                            let fields = t.Split(new[] { "," }, StringSplitOptions.None).Take(88)
                            select string.Join(",", fields);

                var consignments = from cl in port.Process(lines)
                                   where null != cl
                                   select cl.ToJson().DeserializeFromJson<Bespoke.Ost.ConsignmentListFormats.Domain.ConsignmentListFormat>();

                foreach (var consignment in consignments)
                {
                    var tmpConsignment = new Consignment();
                    // assign sender information
                    tmpConsignment.Pemberi.ContactPerson = consignment.SenderName;
                    tmpConsignment.Pemberi.CompanyName = consignment.SenderCompanyName;
                    tmpConsignment.Pemberi.Address.Address1 = consignment.SenderAddress1;
                    tmpConsignment.Pemberi.Address.Address2 = consignment.SenderAddress2;
                    tmpConsignment.Pemberi.Address.Address3 = consignment.SenderAddress3;
                    tmpConsignment.Pemberi.Address.Address4 = consignment.SenderAddress4;
                    tmpConsignment.Pemberi.Address.City = consignment.SenderCity;
                    tmpConsignment.Pemberi.Address.State = consignment.SenderState;
                    tmpConsignment.Pemberi.Address.Country = consignment.SenderCountry;
                    tmpConsignment.Pemberi.Address.Postcode = consignment.SenderPostcode;
                    tmpConsignment.Pemberi.ContactInformation.Email = consignment.SenderEmail;
                    tmpConsignment.Pemberi.ContactInformation.ContactNumber = consignment.SenderContactNumber;
                    tmpConsignment.Pemberi.ContactInformation.AlternativeContactNumber = consignment.SenderAlternativeContactNumber;

                    // assign receiver information
                    tmpConsignment.Penerima.ContactPerson = consignment.ReceiverName;
                    tmpConsignment.Penerima.CompanyName = consignment.ReceiverCompanyName;
                    tmpConsignment.Penerima.Address.Address1 = consignment.ReceiverAddress1;
                    tmpConsignment.Penerima.Address.Address2 = consignment.ReceiverAddress2;
                    tmpConsignment.Penerima.Address.Address3 = consignment.ReceiverAddress3;
                    tmpConsignment.Penerima.Address.Address4 = consignment.ReceiverAddress4;
                    tmpConsignment.Penerima.Address.City = consignment.ReceiverCity;
                    tmpConsignment.Penerima.Address.State = consignment.ReceiverState;
                    tmpConsignment.Penerima.Address.Country = consignment.ReceiverCountry;
                    tmpConsignment.Penerima.Address.Postcode = consignment.ReceiverPostcode;
                    tmpConsignment.Penerima.ContactInformation.Email = consignment.ReceiverEmail;
                    tmpConsignment.Penerima.ContactInformation.ContactNumber = consignment.ReceiverContactNumber;
                    tmpConsignment.Penerima.ContactInformation.AlternativeContactNumber = consignment.ReceiverAlternativeContactNumber;

                    // assign product information
                    tmpConsignment.Produk.Weight = Convert.ToDecimal(consignment.ItemWeightKg, CultureInfo.InvariantCulture);
                    tmpConsignment.Produk.Width = Convert.ToDecimal(consignment.ItemWidthCm, CultureInfo.InvariantCulture);
                    tmpConsignment.Produk.Length = Convert.ToDecimal(consignment.ItemLengthCm, CultureInfo.InvariantCulture);
                    tmpConsignment.Produk.Height = Convert.ToDecimal(consignment.ItemHeightCm, CultureInfo.InvariantCulture);
                    tmpConsignment.Produk.Description = consignment.ItemDescription;

                    tmpConsignment.WebId = Guid.NewGuid().ToString();
                    item.Consignments.Add(tmpConsignment);
                }

                await SaveConsigmentRequest(item);
            } else
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

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
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

        private static string sanitizeShortTimeString(string timeReady)
        {
            var format = timeReady.Split(':');
            if (format[0].Length == 1)
            {
                timeReady = "0" + timeReady;
            }

            return timeReady;
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