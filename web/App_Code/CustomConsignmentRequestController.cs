using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Ost.PosLajuBranchBranches.Domain;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Globalization;
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
    [RoutePrefix("consignment-request")]
    public class CustomConsignmentRequestController : BaseApiController
    {
        private HttpClient m_ostBaseUrl;
        private HttpClient m_sdsBaseUrl;
        private HttpClient m_snbClientApi;
        private string m_applicationName;
        private string m_ostAdminToken;
        private string m_sdsApi_GenerateConnote;
        private string m_sdsSecretKey_GenerateConnote;
        private string m_sdsApi_GenerateConnoteEst;
        private string m_sdsSecretKey_GenerateConnoteEst;
        private string m_sdsApi_PickupWebApi;
        private string m_sdsSecretKey_PickupWebApi;

        public CustomConsignmentRequestController()
        {
            m_ostBaseUrl = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230") };
            m_sdsBaseUrl = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("SdsBaseUrl") ?? "https://apis.pos.com.my") };
            m_snbClientApi = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("SnbWebApi") ?? "http://10.1.1.119:9002/api") };
            m_applicationName = ConfigurationManager.GetEnvironmentVariable("ApplicationName") ?? "OST";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI";
            m_sdsApi_GenerateConnote = ConfigurationManager.GetEnvironmentVariable("SdsApi_GenerateConnote") ?? "apigateway/as01/api/genconnote/v1";
            m_sdsSecretKey_GenerateConnote = ConfigurationManager.GetEnvironmentVariable("SdsSecretKey_GenerateConnote") ?? "MjkzYjA5YmItZjMyMS00YzNmLWFmODktYTc2ZTAxMDgzY2Mz";
            m_sdsApi_GenerateConnoteEst = ConfigurationManager.GetEnvironmentVariable("SdsApi_GenerateConnoteEst") ?? "apigateway/as01/api/generateconnotebaby/v1";
            m_sdsSecretKey_GenerateConnoteEst = ConfigurationManager.GetEnvironmentVariable("SdsSecretKey_GenerateConnoteEst") ?? "NjloNDVKSUtiRm05MGdHR1dtbkdpQ09NOVpSN3hObWU=";
            m_sdsApi_PickupWebApi = ConfigurationManager.GetEnvironmentVariable("SdsApi_PickupWebApi") ?? "apigateway/as2poslaju/api/ezisendpickupwebapi/v1";
            m_sdsSecretKey_PickupWebApi = ConfigurationManager.GetEnvironmentVariable("SdsSecretKey_PickupWebApi") ?? "ckk1cjZ4V2NwSHJWVFZCTVVsSmZGSWtESUpBanNra0g=";
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
            decimal totalInternational = 0;
            decimal totalGst = 0;
            foreach (var consignment in lo.Source.Consignments)
            {
                if (!consignment.Produk.IsInternational)
                {
                    total += consignment.Bill.SubTotal3;
                }
                else
                {
                    totalInternational += consignment.Bill.SubTotal3;
                }
            }
            totalGst = GstCalculation(total, 2);
            total += totalInternational;
            total += totalGst;
            if (!item.Pickup.DateReady.Equals(DateTime.MinValue)
                && !item.Pickup.DateClose.Equals(DateTime.MinValue))
            {
                total += 5.30m;
            }
            item.Payment.TotalPrice = total;

            item.ReferenceNo = GenerateOrderId(item);
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
            var totalConsignmentsInternational = 0;
            var totalConsignmentsDomestic = 0;

            if (item.Payment.IsPaid)
            {
                if (!item.Payment.IsConNoteReady)
                {
                    if (totalConsignments > 0)
                    {
                        foreach (var consignment in item.Consignments)
                        {
                            if (!consignment.Produk.IsInternational)
                            {
                                totalConsignmentsDomestic += 1;
                            }
                            else
                            {
                                totalConsignmentsInternational += 1;
                            }
                        }

                        var sdsConnotesCollection = new List<SdsConnote>();
                        var domesticAvailable = false;
                        //Get Connote for Domestic parcel(s)
                        if (totalConsignmentsDomestic > 0)
                        {
                            domesticAvailable = true;
                            var tempId = GenerateOrderId(item);
                            SdsConnote sdsConnotes = await GetConnoteOst(tempId, totalConsignmentsDomestic, false);
                            if (sdsConnotes.StatusCode == "01")
                            {
                                if (sdsConnotes.ConnoteNumbers.Count >= totalConsignmentsDomestic)
                                {
                                    sdsConnotesCollection.Add(sdsConnotes);
                                }
                                else
                                {
                                    resultSuccess = false;
                                    resultStatus = "Generated consignment note for domestic not enough";
                                }
                            }
                            else
                            {
                                resultSuccess = false;
                                resultStatus = "StatusCode: " + sdsConnotes.StatusCode + " Message: " + sdsConnotes.Message;
                            }
                        }

                        //Get Connote for International parcel(s)
                        if (totalConsignmentsInternational > 0)
                        {
                            var tempId = GenerateOrderId(item);
                            SdsConnote sdsConnotes = await GetConnoteOst(tempId, totalConsignmentsInternational, true);
                            if (sdsConnotes.StatusCode == "01")
                            {
                                if (sdsConnotes.ConnoteNumbers.Count >= totalConsignmentsInternational)
                                {
                                    sdsConnotesCollection.Add(sdsConnotes);
                                }
                                else
                                {
                                    resultSuccess = false;
                                    resultStatus = "Generated consignment note for international not enough";
                                }
                            }
                            else
                            {
                                resultSuccess = false;
                                resultStatus = "StatusCode: " + sdsConnotes.StatusCode + " Message: " + sdsConnotes.Message;
                            }
                        }

                        var sdsCounterDomestic = 0;
                        var sdsCounterInternational = 0;
                        if (domesticAvailable)
                        {
                            foreach (var consignment in item.Consignments)
                            {
                                if (!consignment.Produk.IsInternational)
                                {
                                    consignment.ConNote = sdsConnotesCollection[0].ConnoteNumbers[sdsCounterDomestic];
                                    sdsCounterDomestic++;
                                }
                                else if (consignment.Produk.IsInternational)
                                {
                                    consignment.ConNote = sdsConnotesCollection[1].ConnoteNumbers[sdsCounterInternational];
                                    sdsCounterInternational++;
                                }
                            }
                        }
                        else
                        {
                            foreach (var consignment in item.Consignments)
                            {
                                consignment.ConNote = sdsConnotesCollection[0].ConnoteNumbers[sdsCounterInternational];
                                sdsCounterInternational++;
                            }
                        }
                        item.Payment.IsConNoteReady = true;
                        await SaveConsigmentRequest(item);
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
            var consignmentRequest = lo.Source;

            var resultSuccess = true;
            var resultStatus = "OK";

            var totalConsignments = consignmentRequest.Consignments.Count;
            var emptyConnote = 0;
            var emptyConnoteInternational = 0;
            var emptyConnoteWithBaby = 0;
            var orderId = consignmentRequest.ReferenceNo;
            var numBaby = 0;

            foreach (var consignment in consignmentRequest.Consignments)
            {
                numBaby = CalculateBabyConnotes(consignment.BabyConnotesTotal);

                if (!consignment.Produk.IsInternational)
                {
                    if (consignment.ConNote == null && numBaby == 0 && consignment.Penerima.Address.Postcode != null && consignment.Produk.Weight > 0)
                    {
                        emptyConnote += 1;
                    }
                    else if (consignment.ConNote == null && numBaby > 0 && consignment.Penerima.Address.Postcode != null && consignment.Produk.Weight > 0)
                    {
                        emptyConnoteWithBaby += 1;
                    }
                }
                else
                {
                    if (consignment.ConNote == null && consignment.Produk.IsInternational && consignment.Penerima.Address.Postcode != null && consignment.Produk.Weight > 0)
                    {
                        emptyConnoteInternational += 1;
                    }
                }
            }

            //parent without baby
            if (emptyConnote > 0)
            {
                consignmentRequest.GenerateConnoteCounter += 1;
                orderId = GenerateOrderId(consignmentRequest);
                consignmentRequest.ReferenceNo = orderId;
                SdsBabyConnote sdsBabyConnote = GetConnoteWithOrWithoutBaby(orderId, 0, emptyConnote, false);
                var sdsCounter = 0;
                foreach (var consignment in consignmentRequest.Consignments)
                {
                    numBaby = CalculateBabyConnotes(consignment.BabyConnotesTotal);

                    if (consignment.ConNote == null && !consignment.Produk.IsInternational && numBaby == 0 && consignment.Penerima.Address.Postcode != null && consignment.Produk.Weight > 0)
                    {
                        consignment.ConNote = sdsBabyConnote.ConnoteData[sdsCounter].ConnoteParent;
                        sdsCounter++;
                    }
                }
            }

            //parent with baby
            if (emptyConnoteWithBaby > 0)
            {
                foreach (var consignment in consignmentRequest.Consignments)
                {
                    numBaby = CalculateBabyConnotes(consignment.BabyConnotesTotal);

                    if (consignment.ConNote == null && numBaby > 0 && consignment.Penerima.Address.Postcode != null && consignment.Produk.Weight > 0)
                    {
                        consignmentRequest.GenerateConnoteCounter += 1;
                        orderId = GenerateOrderId(consignmentRequest);
                        consignmentRequest.ReferenceNo = orderId;

                        SdsBabyConnote sdsBabyConnote = GetConnoteWithOrWithoutBaby(orderId, numBaby, 1, consignment.Produk.IsInternational);

                        consignment.ConNote = sdsBabyConnote.ConnoteData[0].ConnoteParent;
                        for (int i = 0; i < numBaby; i++)
                        {
                            consignment.BabyConnotes.Add(sdsBabyConnote.ConnoteData[0].ConnoteBaby[i].ConnoteBabyData);
                        }
                    }
                }
            }

            //IsInternational == EQ
            if (emptyConnoteInternational > 0)
            {
                consignmentRequest.GenerateConnoteCounter += 1;
                orderId = GenerateOrderId(consignmentRequest);
                consignmentRequest.ReferenceNo = orderId;
                SdsBabyConnote sdsBabyConnote = GetConnoteWithOrWithoutBaby(orderId, 0, emptyConnoteInternational, true);
                var sdsCounter = 0;
                foreach (var consignment in consignmentRequest.Consignments)
                {
                    if (consignment.ConNote == null && consignment.Produk.IsInternational && consignment.Penerima.Address.Postcode != null && consignment.Produk.Weight > 0)
                    {
                        consignment.ConNote = sdsBabyConnote.ConnoteData[sdsCounter].ConnoteParent;
                        sdsCounter++;
                    }
                }
            }

            consignmentRequest.ReferenceNo = orderId;
            consignmentRequest.Payment.IsConNoteReady = true;
            await SaveConsigmentRequest(consignmentRequest);

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = consignmentRequest.Id
            };

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpPut]
        [Route("get-and-save-zones/{id}")]
        public async Task<IHttpActionResult> GetAndSaveZones(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);
            var consignmentRequest = lo.Source;

            var resultSuccess = true;
            var resultStatus = "OK";

            if (consignmentRequest.Pickup.Address.Postcode != null)
            {
                m_ostBaseUrl.DefaultRequestHeaders.Clear();
                m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
                var requestUri = $"{m_ostBaseUrl.BaseAddress}/consignment-request/get-pickup-availability/{consignmentRequest.Pickup.Address.Postcode}";
                var response = await m_ostBaseUrl.GetAsync(requestUri);
                var output = string.Empty;
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"RequestUri: {requestUri.ToString()}");
                    Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
                    output = await response.Content.ReadAsStringAsync();
                }
                else
                {
                    Console.WriteLine($"RequestUri: {requestUri.ToString()}");
                    Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
                    if (response.StatusCode == HttpStatusCode.NotFound)
                    {
                        return NotFound("Cannot find branch with postcode:" + consignmentRequest.Pickup.Address.Postcode);
                    }
                    else
                    {
                        return BadRequest("GetPickupAvailability() Error");
                    }
                }
                var posLajuBranch = output.DeserializeFromJson<PosLajuBranch>();

                foreach (var consignment in consignmentRequest.Consignments)
                {
                    if (consignment.Bill.ZoneName == null)
                    {
                        var itemCategory = consignment.Produk.ItemCategory == "02" ? "merchandise" : "document";
                        var productCode = consignment.Produk.IsInternational == true ? "OST3001" : "OST1001";
                        var getZoneModal = new GetZoneModel()
                        {
                            ProductCode = productCode,
                            ItemCategory = itemCategory,
                            ReceiverPostCode = consignment.Penerima.Address.Postcode.ToString(),
                            BranchCode = posLajuBranch.BranchCode.ToString()
                        };

                        m_snbClientApi.DefaultRequestHeaders.Clear();
                        m_snbClientApi.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
                        m_snbClientApi.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        requestUri = $"{m_snbClientApi.BaseAddress}/get-zone-byproduct";
                        var json = JsonConvert.SerializeObject(getZoneModal);
                        var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
                        var resultSnb = m_snbClientApi.PostAsync(requestUri, content).Result;
                        var outputSnb = string.Empty;
                        if (resultSnb.IsSuccessStatusCode)
                        {
                            Console.WriteLine($"Status: {(int)resultSnb.StatusCode} {resultSnb.ReasonPhrase.ToString()}");
                            outputSnb = await resultSnb.Content.ReadAsStringAsync();
                        }
                        else
                        {
                            Console.WriteLine($"Status: {(int)resultSnb.StatusCode} {resultSnb.ReasonPhrase.ToString()}");
                            continue;
                        }
                        var zoneName = JObject.Parse(outputSnb).SelectToken("ZoneName");
                        consignment.Bill.ZoneName = zoneName.ToString();
                    }
                }
                try
                {
                    await SaveConsigmentRequest(consignmentRequest);
                }
                catch (Exception e)
                {
                    resultSuccess = false;
                    resultStatus = $"{e.Message}.";
                }
            }

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = consignmentRequest.Id
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
                        string timeReady = item.Pickup.DateReady.ToShortTimeString();
                        timeReady = SanitizeShortTimeString(timeReady);
                        string timeClose = item.Pickup.DateClose.ToShortTimeString();
                        timeClose = SanitizeShortTimeString(timeClose);

                        DateTime currentTime = DateTime.Now;
                        DateTime cutOffTime = DateTime.ParseExact("12:00 PM", "hh:mm tt", CultureInfo.InvariantCulture);
                        DateTime tReady = DateTime.ParseExact(timeReady, "hh:mm tt", CultureInfo.InvariantCulture);
                        DateTime tClose = DateTime.ParseExact(timeClose, "hh:mm tt", CultureInfo.InvariantCulture);
                        DateTime pickupDate;
                        if (currentTime < cutOffTime)
                        {
                            item.Pickup.DateReady = tReady;
                            item.Pickup.DateClose = tClose;
                            pickupDate = DateTime.Now;
                        }
                        else
                        {
                            item.Pickup.DateReady = tReady.AddDays(1);
                            item.Pickup.DateClose = tClose.AddDays(1);
                            pickupDate = DateTime.Today.AddDays(1);
                        }

                        m_sdsBaseUrl.DefaultRequestHeaders.Clear();
                        m_sdsBaseUrl.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_PickupWebApi);
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
                        if (userProfile.Designation == "No contract customer")
                        {
                            url.Append($"&accNoF=ENTT-OST-{item.UserId}");
                            url.Append($"&typeF=OE");
                        }
                        else
                        {
                            url.Append($"&accNoF={item.UserId}");
                            url.Append($"&typeF=CE");
                        }
                        url.Append($"&pickup_dateF={pickupDate.ToString("yyyy/MM/dd hh:mm:ss tt")}");
                        url.Append($"&_readyF={timeReady}");
                        url.Append($"&_closeF={timeClose}");

                        var output = await m_sdsBaseUrl.GetStringAsync($"{m_sdsBaseUrl.BaseAddress}/{url.ToString()}");
                        var json = JObject.Parse(output);
                        var sdsPickup = new SdsPickup(json);
                        if (sdsPickup.StatusCode == "00")
                        {
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

            var ext = Path.GetExtension(doc.FileName).ToLower();
            if (ext != ".xlsx")
            {
                return Ok(new { success = false, status = "Invalid file format. Only *.xlsx file is supported." });
            }

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
                    var countAddedConsignment = 0;
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
                        consignment.Produk.ItemCategory = "02"; //default to "Merchandise"
                        consignment.Produk.IsInternational = (consignment.Penerima.Address.Country == "MY") ? false : true;

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
                        countAddedConsignment += 1;
                    }

                    resultStatus = $"{countAddedConsignment} parcel(s) added.";

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
        public IHttpActionResult ExportConsignments([FromBody]List<Consignment> consignments)
        {
            var temp = Path.GetTempFileName() + ".xlsx";
            System.IO.File.Copy(System.Web.HttpContext.Current.Server.MapPath("~/Content/Files/consignment_list_format_template.xlsx"), temp, true);

            var file = new FileInfo(temp);
            var excel = new ExcelPackage(file);
            var ws = excel.Workbook.Worksheets["Consignments"];
            if (null == ws) return Ok(new { success = false, status = $"Cannot open Worksheet Consignments" });

            var existingLinesInTemplate = 2;
            var row = 2;

            //Empty existing lines in template
            if (consignments.Count < 2)
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

                    ws.Cells[row + i, 14].Value = string.Empty;
                    ws.Cells[row + i, 15].Value = string.Empty;
                    ws.Cells[row + i, 16].Value = string.Empty;
                    ws.Cells[row + i, 17].Value = string.Empty;
                    ws.Cells[row + i, 18].Value = string.Empty;
                    ws.Cells[row + i, 19].Value = string.Empty;
                    ws.Cells[row + i, 20].Value = string.Empty;
                    ws.Cells[row + i, 21].Value = string.Empty;
                    ws.Cells[row + i, 22].Value = string.Empty;
                    ws.Cells[row + i, 23].Value = string.Empty;
                    ws.Cells[row + i, 24].Value = string.Empty;
                    ws.Cells[row + i, 25].Value = string.Empty;
                    ws.Cells[row + i, 26].Value = string.Empty;

                    ws.Cells[row + i, 27].Value = string.Empty;
                    ws.Cells[row + i, 28].Value = string.Empty;
                    ws.Cells[row + i, 29].Value = string.Empty;
                    ws.Cells[row + i, 30].Value = string.Empty;
                    ws.Cells[row + i, 31].Value = string.Empty;
                }
            }

            foreach (var consignment in consignments)
            {
                ws.Cells[row, 1].Value = consignment.Pemberi.ContactPerson;
                ws.Cells[row, 2].Value = consignment.Pemberi.CompanyName;
                ws.Cells[row, 3].Value = consignment.Pemberi.ContactInformation.Email;
                ws.Cells[row, 4].Value = consignment.Pemberi.ContactInformation.ContactNumber;
                ws.Cells[row, 5].Value = consignment.Pemberi.ContactInformation.AlternativeContactNumber;
                ws.Cells[row, 6].Value = consignment.Pemberi.Address.Address1;
                ws.Cells[row, 7].Value = consignment.Pemberi.Address.Address2;
                ws.Cells[row, 8].Value = consignment.Pemberi.Address.Address3;
                ws.Cells[row, 9].Value = consignment.Pemberi.Address.Address4;
                ws.Cells[row, 10].Value = consignment.Pemberi.Address.City;
                ws.Cells[row, 11].Value = consignment.Pemberi.Address.State;
                ws.Cells[row, 12].Value = consignment.Pemberi.Address.Country;
                ws.Cells[row, 13].Value = consignment.Pemberi.Address.Postcode;

                ws.Cells[row, 14].Value = consignment.Penerima.ContactPerson;
                ws.Cells[row, 15].Value = consignment.Penerima.CompanyName;
                ws.Cells[row, 16].Value = consignment.Penerima.ContactInformation.Email;
                ws.Cells[row, 17].Value = consignment.Penerima.ContactInformation.ContactNumber;
                ws.Cells[row, 18].Value = consignment.Penerima.ContactInformation.AlternativeContactNumber;
                ws.Cells[row, 19].Value = consignment.Penerima.Address.Address1;
                ws.Cells[row, 20].Value = consignment.Penerima.Address.Address2;
                ws.Cells[row, 21].Value = consignment.Penerima.Address.Address3;
                ws.Cells[row, 22].Value = consignment.Penerima.Address.Address4;
                ws.Cells[row, 23].Value = consignment.Penerima.Address.City;
                ws.Cells[row, 24].Value = consignment.Penerima.Address.State;
                ws.Cells[row, 25].Value = consignment.Penerima.Address.Country;
                ws.Cells[row, 26].Value = consignment.Penerima.Address.Postcode;

                ws.Cells[row, 27].Value = consignment.Produk.Weight;
                ws.Cells[row, 28].Value = consignment.Produk.Width;
                ws.Cells[row, 29].Value = consignment.Produk.Length;
                ws.Cells[row, 30].Value = consignment.Produk.Height;
                ws.Cells[row, 31].Value = consignment.Produk.Description;

                row++;
            }

            excel.Save();
            excel.Dispose();

            return Json(new { success = true, status = "OK", path = Path.GetFileName(temp) });
        }

        [HttpPut]
        [Route("export-tallysheet/{id}")]
        public async Task<IHttpActionResult> ExportTallysheet(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var item = lo.Source;

            var temp = Path.GetTempFileName() + ".xlsx";
            System.IO.File.Copy(System.Web.HttpContext.Current.Server.MapPath("~/Content/Files/tallysheet_format_template.xlsx"), temp, true);

            var file = new FileInfo(temp);
            var excel = new ExcelPackage(file);
            var ws = excel.Workbook.Worksheets["Consignments"];
            if (null == ws) return Ok(new { success = false, status = $"Cannot open Worksheet Consignments" });

            var row = 2;
            var consignmentIndexNumber = 1;

            foreach (var consignment in item.Consignments)
            {
                if (!string.IsNullOrEmpty(consignment.ConNote))
                {
                    var connoteNumbers = new StringBuilder();
                    connoteNumbers.Append($"{consignment.ConNote}");
                    foreach (var babyConnote in consignment.BabyConnotes)
                    {
                        connoteNumbers.Append($", {babyConnote}");
                    }

                    //TODO: tallysheet date must refer to connote numbers generated date
                    DateTime tallysheetDate = (item.Pickup.IsPickedUp) ? item.ChangedDate : DateTime.Now;

                    var receiverAddress = new StringBuilder();
                    receiverAddress.Append($"{consignment.Penerima.Address.Address1}");
                    receiverAddress.Append($" {consignment.Penerima.Address.Address2}");
                    receiverAddress.Append($", {consignment.Penerima.Address.Address3}");
                    receiverAddress.Append($" {consignment.Penerima.Address.Address4}");
                    receiverAddress.Append($", {consignment.Penerima.Address.Postcode}");
                    receiverAddress.Append($" {consignment.Penerima.Address.City}");
                    receiverAddress.Append($", {consignment.Penerima.Address.State}");
                    receiverAddress.Append($" {consignment.Penerima.Address.Country}");

                    decimal volumetricWeight = 0.00m;
                    if (consignment.Produk.Width > 0 && consignment.Produk.Length > 0 && consignment.Produk.Height > 0)
                    {
                        volumetricWeight = (consignment.Produk.Width * consignment.Produk.Length * consignment.Produk.Height) / 6000;
                    }

                    var productDescription = consignment.Produk.Description;
                    if (consignment.Produk.IsInternational)
                    {
                        productDescription = consignment.Produk.CustomDeclaration.ContentDescription1;
                        if (!string.IsNullOrEmpty(consignment.Produk.CustomDeclaration.ContentDescription2))
                            productDescription += " " + consignment.Produk.CustomDeclaration.ContentDescription2;
                        if (!string.IsNullOrEmpty(consignment.Produk.CustomDeclaration.ContentDescription3))
                            productDescription += " " + consignment.Produk.CustomDeclaration.ContentDescription3;
                    }

                    ws.Cells[row, 1].Value = consignmentIndexNumber;
                    ws.Cells[row, 2].Value = tallysheetDate.ToString("dd/MM/yyyy");
                    ws.Cells[row, 3].Value = connoteNumbers;
                    ws.Cells[row, 4].Value = consignment.Penerima.ContactPerson;
                    ws.Cells[row, 5].Value = receiverAddress;
                    ws.Cells[row, 6].Value = consignment.Penerima.ContactInformation.Email;
                    ws.Cells[row, 7].Value = consignment.Penerima.ContactInformation.ContactNumber;
                    ws.Cells[row, 8].Value = consignment.Penerima.ContactInformation.AlternativeContactNumber;
                    ws.Cells[row, 9].Value = consignment.Produk.Weight;
                    ws.Cells[row, 10].Value = consignment.Bill.ActualWeight;
                    ws.Cells[row, 11].Value = consignment.Produk.Width;
                    ws.Cells[row, 12].Value = consignment.Produk.Length;
                    ws.Cells[row, 13].Value = consignment.Produk.Height;
                    ws.Cells[row, 14].Value = volumetricWeight;
                    ws.Cells[row, 15].Value = consignment.Bill.VolumetricWeight;
                    ws.Cells[row, 16].Value = productDescription;
                    ws.Cells[row, 17].Value = consignment.Produk.Est.ShipperReferenceNo;
                    ws.Cells[row, 18].Value = consignment.Produk.Est.ReceiverReferenceNo;
                }

                row++;
                consignmentIndexNumber++;
            }

            excel.Save();
            excel.Dispose();

            return Json(new { success = true, status = "OK", path = Path.GetFileName(temp) });
        }

        [HttpPut]
        [Route("export-pickup-manifest/{id}")]
        public async Task<IHttpActionResult> ExportPickupManifest(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var item = lo.Source;

            var temp = Path.GetTempFileName() + ".xlsx";
            System.IO.File.Copy(System.Web.HttpContext.Current.Server.MapPath("~/Content/Files/pickup_manifest_format_template.xlsx"), temp, true);

            var file = new FileInfo(temp);
            var excel = new ExcelPackage(file);
            var ws = excel.Workbook.Worksheets["Pickup Manifest"];
            if (null == ws) return Ok(new { success = false, status = "Cannot open Worksheet Pickup Manifest" });
            if (string.IsNullOrEmpty(item.Pickup.Number)) return Ok(new { success = false, status = "Cannot generate Pickup Manifest. Please schedule a pickup." });

            var pickupDate = item.Pickup.DateReady.ToString("dd/MM/yyyy");
            ws.Cells[1, 2].Value = pickupDate;
            ws.Cells[2, 2].Value = item.Pickup.Number;
            ws.Cells[3, 2].Value = item.UserId;

            var row = 6;
            var consignmentIndexNumber = 1;

            foreach (var consignment in item.Consignments)
            {
                if (!string.IsNullOrEmpty(consignment.ConNote))
                {
                    var connoteNumbers = new StringBuilder();
                    connoteNumbers.Append($"{consignment.ConNote}");
                    foreach (var babyConnote in consignment.BabyConnotes)
                    {
                        connoteNumbers.Append($", {babyConnote}");
                    }

                    var itemCategory = (consignment.Produk.ItemCategory == "01") ? "Document" : "Merchandise";

                    ws.Cells[row, 1].Value = pickupDate;
                    ws.Cells[row, 2].Value = connoteNumbers;
                    ws.Cells[row, 3].Value = itemCategory;
                    ws.Cells[row, 4].Value = consignment.Produk.Weight;
                }

                row++;
                consignmentIndexNumber++;
            }

            excel.Save();
            excel.Dispose();

            return Json(new { success = true, status = "OK", path = Path.GetFileName(temp) });
        }

        [HttpPut]
        [Route("export-pickup-daily/{start:datetime}/{end:datetime}")]
        public async Task<IHttpActionResult> ExportPickupDaily(DateTime start, DateTime end)
        {
            var temp = Path.GetTempFileName() + ".xlsx";
            System.IO.File.Copy(System.Web.HttpContext.Current.Server.MapPath("~/Content/Files/pickup_daily_format_template.xlsx"), temp, true);

            var file = new FileInfo(temp);
            var excel = new ExcelPackage(file);
            var ws = excel.Workbook.Worksheets["branchcode"];
            if (null == ws) return Ok(new { success = false, status = "Cannot open Worksheet Pickup Manifest" });

            var queryString = $"size=100&q=Pickup.DateReady:[\"{start.ToString("yyyy-MM-dd")}\" TO \"{end.ToString("yyyy-MM-dd")}\"]";

            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/consigment-requests/paid-all/con-note-ready/true/picked-up/false?{queryString}";
            var response = await m_ostBaseUrl.GetAsync(requestUri);

            var output = string.Empty;
            if (response.IsSuccessStatusCode) output = await response.Content.ReadAsStringAsync();
            else return Ok(new { success = false, status = $"RequestUri:{requestUri.ToString()} Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}" });

            var json = JObject.Parse(output).SelectToken("$._results");
            var consignmentRequests = new List<ConsigmentRequest>();
            foreach (var jtok in json)
            {
                var consignmentRequest = jtok.ToJson().DeserializeFromJson<ConsigmentRequest>();
                consignmentRequests.Add(consignmentRequest);
            }

            var row = 7;
            var consignmentIndexNumber = 1;

            foreach (var consignmentRequest in consignmentRequests)
            {
                foreach (var consignment in consignmentRequest.Consignments)
                {
                    var pickupDateAndTime = new StringBuilder();
                    pickupDateAndTime.Append($"{consignmentRequest.Pickup.DateReady.ToString("yyyy-MM-dd")} ");
                    pickupDateAndTime.Append($"{consignmentRequest.Pickup.DateReady.ToString("hh:mm:ss tt")}");
                    pickupDateAndTime.Append($" - ");
                    pickupDateAndTime.Append($"{consignmentRequest.Pickup.DateClose.ToString("hh:mm:ss tt")}");

                    var pickupAddress = new StringBuilder();
                    pickupAddress.AppendLine($"{consignmentRequest.Pickup.ContactPerson}");
                    pickupAddress.AppendLine($"{consignmentRequest.Pickup.ContactInformation.ContactNumber}");
                    pickupAddress.AppendLine($"{consignmentRequest.Pickup.Address.Address1},");
                    pickupAddress.AppendLine($"{consignmentRequest.Pickup.Address.Address2},");
                    if (!string.IsNullOrEmpty(consignmentRequest.Pickup.Address.Address3))
                        pickupAddress.AppendLine($"{consignmentRequest.Pickup.Address.Address3},");
                    if (!string.IsNullOrEmpty(consignmentRequest.Pickup.Address.Address4))
                        pickupAddress.AppendLine($"{consignmentRequest.Pickup.Address.Address4},");
                    pickupAddress.AppendLine($"{consignmentRequest.Pickup.Address.Postcode} ");
                    pickupAddress.Append($"{consignmentRequest.Pickup.Address.City},");
                    pickupAddress.AppendLine($"{consignmentRequest.Pickup.Address.State} ");
                    pickupAddress.Append($"{consignmentRequest.Pickup.Address.Country}.");

                    var receiverAddress = new StringBuilder();
                    receiverAddress.AppendLine($"{consignment.Penerima.ContactPerson}");
                    receiverAddress.AppendLine($"{consignment.Penerima.ContactInformation.ContactNumber}");
                    receiverAddress.AppendLine($"{consignment.Penerima.Address.Address1},");
                    receiverAddress.AppendLine($"{consignment.Penerima.Address.Address2},");
                    if (!string.IsNullOrEmpty(consignment.Penerima.Address.Address3))
                        receiverAddress.AppendLine($"{consignment.Penerima.Address.Address3},");
                    if (!string.IsNullOrEmpty(consignment.Penerima.Address.Address4))
                        receiverAddress.AppendLine($"{consignment.Penerima.Address.Address4},");
                    receiverAddress.AppendLine($"{consignment.Penerima.Address.Postcode} ");
                    receiverAddress.Append($"{consignment.Penerima.Address.City},");
                    receiverAddress.AppendLine($"{consignment.Penerima.Address.State} ");
                    receiverAddress.Append($"{consignment.Penerima.Address.Country}.");

                    ws.Cells[row, 1].Value = consignmentIndexNumber;
                    ws.Cells[row, 2].Value = pickupDateAndTime.ToString();
                    ws.Cells[row, 3].Value = consignmentRequest.Pickup.Number;
                    ws.Cells[row, 4].Value = consignment.ConNote;
                    ws.Cells[row, 5].Value = string.Format("{0:F3}", pickupAddress.ToString());
                    ws.Cells[row, 6].Value = string.Format("{0:F3}", receiverAddress.ToString());
                    ws.Cells[row, 7].Value = "1";
                    ws.Cells[row, 8].Value = consignment.Produk.Weight;
                    ws.Cells[row, 9].Value = consignment.Bill.VolumetricWeight;
                    ws.Cells[row, 10].Value = (consignment.Produk.IsInternational) ? "EMS" : "NDD";
                    ws.Cells[row, 11].Value = (consignment.Produk.IsInternational) ? "Yes" : "No";
                    ws.Cells[row, 12].Value = (consignment.Produk.ValueAddedDeclaredValue > 0) ? "Yes" : "No";
                    ws.Cells[row, 13].Value = consignmentRequest.ReferenceNo;
                    ws.Cells[row, 14].Value = string.Format("{0:F2}", consignment.Produk.Price);
                    row++;
                    consignmentIndexNumber++;
                }
            }

            var excelTitle = ws.Cells[1, 1].GetValue<string>();
            ws.Cells[1, 1].Value = $"{excelTitle} {start.ToString("yyyy-MM-dd")} - {end.ToString("yyyy-MM-dd")}";//TODO: branchname
            ws.Name = "BBB"; //TODO: branchcode

            excel.Save();
            excel.Dispose();

            return Json(new { success = true, status = "OK", path = Path.GetFileName(temp) });
        }

        [HttpPut]
        [Route("save-setting-est/{id}")]
        public async Task<IHttpActionResult> SaveSettingEst(string id)
        {
            var setting = await GetSetting(id);

            var context = new SphDataContext();
            using (var session = context.OpenSession())
            {
                session.Delete(setting);
                await session.SubmitChanges("Default");
            }
            return Ok(new { success = true, status = "OK" });
        }

        [HttpGet]
        [Route("calculate-gst/{value}/{rounded}")]
        public IHttpActionResult CalculateGst(decimal value = 0.00m, int rounded = 2)
        {
            decimal gstValue = GstCalculation(value, rounded);
            return Ok(gstValue);
        }

        public static decimal GstCalculation(decimal value, int rounded = 2)
        {
            var gstValue = value * 0.06m;
            gstValue = decimal.Round(gstValue, rounded);
            return gstValue;
        }

        private static async Task<Setting> GetSetting(string id)
        {
            var context = new SphDataContext();
            var setting = await context.LoadOneAsync<Setting>(x => x.Id == id);
            return setting;
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

        private async Task<UserProfile> GetDesignation()
        {
            var username = User.Identity.Name;
            var directory = new SphDataContext();
            var userProfile = await directory.LoadOneAsync<UserProfile>(p => p.UserName == username) ?? new UserProfile();
            return userProfile;
        }

        private string GenerateOrderId(ConsigmentRequest item)
        {
            var orderId = item.ReferenceNo;
            Guid guidResult = Guid.Parse(item.Id);
            bool isValid = Guid.TryParse(orderId, out guidResult);
            Random rnd = new Random();
            int rndTail = rnd.Next(1000, 10000);

            if (isValid || !item.ReferenceNo.Contains(m_applicationName.ToUpper()))
            {
                var referenceNo = new StringBuilder();
                referenceNo.Append($"{m_applicationName.ToUpper()}-");
                referenceNo.Append(DateTime.Now.ToString("ddMMyy-"));
                referenceNo.Append(rndTail.ToString() + "-");
                referenceNo.Append((item.ReferenceNo.Split('-'))[1]);
                orderId = referenceNo.ToString();
            }
            else
            {
                var arrOrderId = orderId.Split('-');
                if (item.Designation == "Contract customer")
                {
                    if (arrOrderId.Length == 4)
                    {
                        orderId = orderId + "-" + item.GenerateConnoteCounter.ToString();
                    }
                    else
                    {
                        orderId = arrOrderId[0] + "-" + arrOrderId[1] + "-" + arrOrderId[2] + "-" + arrOrderId[3] + "-" + item.GenerateConnoteCounter.ToString();
                    }
                }
                else
                {
                    orderId = arrOrderId[0] + "-" + arrOrderId[1] + "-" + rndTail.ToString() + "-" + arrOrderId[3];
                }
            }
            return orderId;
        }

        private static int CalculateBabyConnotes(int babyConnotesTotal)
        {
            int numBaby;
            if (babyConnotesTotal > 0)
            {
                numBaby = babyConnotesTotal - 1;
            }
            else
            {
                numBaby = 0;
            }
            return numBaby;
        }

        private SdsBabyConnote GetConnoteWithOrWithoutBaby(string orderId, int numBaby, int numParent, bool IsInternational)
        {
            m_snbClientApi.DefaultRequestHeaders.Clear();
            m_snbClientApi.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_GenerateConnoteEst);
            var url = new StringBuilder();
            url.Append(m_sdsApi_GenerateConnoteEst);
            url.Append($"?numberOfItemParent={numParent.ToString()}");
            if (!IsInternational)
            {
                url.Append("&PrefixParent=EU");
            }
            else
            {
                url.Append("&PrefixParent=EQ");
            }
            url.Append($"&numberOfItemBaby={numBaby.ToString()}");
            url.Append("&PrefixBaby=EB");
            //url.Append("&PrefixBaby=ED"); // stagging
            url.Append("&ApplicationCode=OST");
            url.Append("&Secretid=ost@1234");
            url.Append($"&Orderid={orderId}");
            url.Append("&username=entt.ost");

            var output = m_snbClientApi.GetStringAsync($"{m_sdsBaseUrl.BaseAddress}/{url.ToString()}").Result;
            var json = JObject.Parse(output);
            var sdsBabyConnote = json.ToJson().DeserializeFromJson<SdsBabyConnote>();
            return sdsBabyConnote;
        }

        private async Task<SdsConnote> GetConnoteOst(string tempId, int totalConsignments, bool IsInternational)
        {
            m_sdsBaseUrl.DefaultRequestHeaders.Clear();
            m_sdsBaseUrl.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_GenerateConnote);
            var url = new StringBuilder();
            url.Append(m_sdsApi_GenerateConnote);
            if (!IsInternational)
            {
                url.Append("?Prefix=EU");
            }
            else
            {
                url.Append("?Prefix=EQ");
            }
            url.Append("&ApplicationCode=OST");
            url.Append("&Secretid=ost@1234");
            url.Append("&username=entt.ost");
            url.Append($"&numberOfItem={totalConsignments.ToString()}");
            url.Append($"&Orderid={tempId}");

            var output = await m_sdsBaseUrl.GetStringAsync($"{m_sdsBaseUrl.BaseAddress}/{url.ToString()}");

            var json = JObject.Parse(output);
            var sdsConnote = new SdsConnote(json);
            return sdsConnote;
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

    public class SdsBabyConnote
    {
        public List<ConnoteData> ConnoteData { get; set; }
        public string StatusCode { get; set; }
        public string Message { get; set; }
    }

    public class GetZoneModel
    {
        public string ProductCode { get; set; }
        public string ItemCategory { get; set; }
        public string ReceiverPostCode { get; set; }
        public string BranchCode { get; set; }
    }

    public class ConnoteBaby
    {
        public string ConnoteBabyData { get; set; }
        public string Result { get; set; }
    }

    public class ConnoteData
    {
        public List<ConnoteBaby> ConnoteBaby { get; set; }
        public string ConnoteParent { get; set; }
        public string Result { get; set; }
    }
}