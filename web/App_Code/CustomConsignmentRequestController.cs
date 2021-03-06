﻿using Bespoke.Ost.ConsigmentRequests.Domain;
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
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;

namespace web.sph.App_Code
{
    [RoutePrefix("consignment-request")]
    public class CustomConsignmentRequestController : BaseApiController
    {
        enum ConnotePrefixType { Domestic, International, CodCcod };
        private HttpClient m_ostBaseUrl;
        private HttpClient m_sdsBaseUrl;
        private HttpClient m_snbClientApi;
        private HttpClient m_clientBromApi;
        private string m_applicationName;
        private string m_ostAdminToken;
        private string m_sdsApi_GenerateConnote;
        private string m_sdsSecretKey_GenerateConnote;
        private string m_sdsApi_PickupWebApi;
        private string m_sdsSecretKey_PickupWebApi;

        public CustomConsignmentRequestController()
        {
            m_ostBaseUrl = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230") };
            m_sdsBaseUrl = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("SdsBaseUrl") ?? "https://apis.pos.com.my") };
            m_snbClientApi = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("SnbWebApi") ?? "http://10.1.1.119:9002/api") };
            m_clientBromApi = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("BromApi") ?? "http://10.1.3.71:81/api") };
            m_applicationName = ConfigurationManager.GetEnvironmentVariable("ApplicationName") ?? "OST";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI";
            m_sdsApi_GenerateConnote = ConfigurationManager.GetEnvironmentVariable("SdsApi_GenerateConnote") ?? "apigateway/as01/api/genconnote/v1";
            m_sdsSecretKey_GenerateConnote = ConfigurationManager.GetEnvironmentVariable("SdsSecretKey_GenerateConnote") ?? "MjkzYjA5YmItZjMyMS00YzNmLWFmODktYTc2ZTAxMDgzY2Mz";
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
            var item = lo.Source;

            var resultSuccess = true;
            var resultStatus = "OK";

            if (!item.Payment.IsPaid)
            {
                resultSuccess = false;
                resultStatus = "Consignment Request has not been paid";
            }
            if (item.Payment.IsConNoteReady)
            {
                resultSuccess = false;
                resultStatus = "Consignment note was already generated";
            }
            if (item.Consignments.Count == 0)
            {
                resultSuccess = false;
                resultStatus = "Consignment not found";
            }

            if (resultSuccess)
            {
                var totalConsignmentsDomestic = 0;
                var totalConsignmentsInternational = 0;

                //Count number of Domestic and International parcel(s)
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

                //Get Connote for Domestic parcel(s)
                if (totalConsignmentsDomestic > 0)
                {
                    AssignDomesticConnotes(item, totalConsignmentsDomestic, ref resultSuccess, ref resultStatus);
                }

                //Get Connote for International parcel(s)
                if (totalConsignmentsInternational > 0)
                {
                    AssignInternationalConnotes(item, totalConsignmentsInternational, ref resultSuccess, ref resultStatus);
                }

                if (resultSuccess)
                {
                    item.Payment.IsConNoteReady = true;
                    await SaveConsigmentRequest(item);
                }
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

            if (consignmentRequest.Consignments.Count == 0)
            {
                resultSuccess = false;
                resultStatus = "Consignment not found";
            }
            else
            {
                var totalConsignmentsDomestic = 0;
                var totalConsignmentsInternational = 0;
                var totalConsignmentsCodCCod = 0;

                foreach (var consignment in consignmentRequest.Consignments)
                {
                    if (consignment.ConNote == null)
                    {
                        if (!consignment.Produk.IsInternational)
                        {
                            if (consignment.Produk.Est.CodAmount > 0 || consignment.Produk.Est.CcodAmount > 0)
                            {
                                totalConsignmentsCodCCod += 1;
                            }
                            else
                            {
                                totalConsignmentsDomestic += 1;
                            }
                        }
                        else
                        {
                            totalConsignmentsInternational += 1;
                        }
                    }
                }

                //Get Connote for Domestic parcel(s)
                if (totalConsignmentsDomestic > 0)
                {
                    AssignDomesticConnotes(consignmentRequest, totalConsignmentsDomestic, ref resultSuccess, ref resultStatus);
                }

                //Get Connote for International parcel(s)
                if (totalConsignmentsInternational > 0)
                {
                    AssignInternationalConnotes(consignmentRequest, totalConsignmentsInternational, ref resultSuccess, ref resultStatus);
                }

                //Get Connote for Cod / Ccod parcel(s)
                if (totalConsignmentsCodCCod > 0)
                {
                    AssignCodCcodConnotes(consignmentRequest, totalConsignmentsCodCCod, ref resultSuccess, ref resultStatus);
                }

                if (resultSuccess)
                {
                    consignmentRequest.Payment.IsConNoteReady = true;
                    await SaveConsigmentRequest(consignmentRequest);
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
                PosLajuBranch posLajuBranch = await GetBranch(int.Parse(consignmentRequest.Pickup.Address.Postcode));

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
                        m_snbClientApi.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        var requestUri = $"{m_snbClientApi.BaseAddress}/get-zone-byproduct";
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
            PosLajuBranch branch = await GetBranch(postcode);

            if (branch == null)
            {
                return NotFound("No pickup for postcode: " + postcode);
            }

            return Ok(branch);
        }

        [HttpGet]
        [Route("validate-postcode/{postcode}")]
        public async Task<IHttpActionResult> ValidatePostcode(int postcode)
        {
            var queryString = $"{m_clientBromApi.BaseAddress}/branches/postcode/{postcode}/routing-code";
            var response = await m_clientBromApi.GetAsync(queryString);

            var output = string.Empty;
            if (response.IsSuccessStatusCode) output = await response.Content.ReadAsStringAsync();
            else return NotFound();

            return Json(output);
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
        [Route("schedule-pickup")]
        public async Task<IHttpActionResult> ScheduleAndSavePickup(ConsigmentRequest item)
        {
            var resultSuccess = true;
            var resultStatus = "OK";

            UserProfile userProfile = await GetDesignation();

            if (userProfile.Designation == "No contract customer")
            {
                LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(item.Id);
                if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + item.Id);
                item = lo.Source;
            }

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
            bool hasRow = true, allRequired = false;
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
                    //Get all required field.
                    var PemberiContactPerson = ws.Cells[$"A{row}"].GetValue<string>();
                    var PemberiEmail = ws.Cells[$"C{row}"].GetValue<string>();
                    var PemberiContactNumber = ws.Cells[$"D{row}"].GetValue<string>();
                    var PemberiAddress1 = ws.Cells[$"F{row}"].GetValue<string>();
                    var PemberiAddress2 = ws.Cells[$"G{row}"].GetValue<string>();
                    var PemberiCity = ws.Cells[$"J{row}"].GetValue<string>();
                    var PemberiState = ws.Cells[$"K{row}"].GetValue<string>();
                    var PemberiCountry = ws.Cells[$"L{row}"].GetValue<string>();
                    var PemberiPostcode = ws.Cells[$"M{row}"].GetValue<string>();
                    var PenerimaContactPerson = ws.Cells[$"N{row}"].GetValue<string>();
                    var PenerimaEmail = ws.Cells[$"P{row}"].GetValue<string>();
                    var PenerimaContactNumber = ws.Cells[$"Q{row}"].GetValue<string>();
                    var PenerimaAddress1 = ws.Cells[$"S{row}"].GetValue<string>();
                    var PenerimaAddress2 = ws.Cells[$"T{row}"].GetValue<string>();
                    var PenerimaCity = ws.Cells[$"W{row}"].GetValue<string>();
                    var PenerimaState = ws.Cells[$"X{row}"].GetValue<string>();
                    var PenerimaCountry = ws.Cells[$"Y{row}"].GetValue<string>();
                    var PenerimaPostcode = ws.Cells[$"Z{row}"].GetValue<string>();
                    var ProdukWeight = ws.Cells[$"AA{row}"].GetValue<string>();
                    var ProdukWidth = ws.Cells[$"AB{row}"].GetValue<string>();
                    var ProdukLength = ws.Cells[$"AC{row}"].GetValue<string>();
                    var ProdukHeigth = ws.Cells[$"AD{row}"].GetValue<string>();
                    var ProdukDescription = ws.Cells[$"AE{row}"].GetValue<string>();

                    hasRow = !string.IsNullOrEmpty(PemberiContactPerson) && !string.IsNullOrEmpty(PemberiEmail)
                        && !string.IsNullOrEmpty(PemberiContactNumber) && !string.IsNullOrEmpty(PemberiAddress1)
                        && !string.IsNullOrEmpty(PemberiAddress2) && !string.IsNullOrEmpty(PemberiCity)
                        && !string.IsNullOrEmpty(PemberiState) && !string.IsNullOrEmpty(PemberiCountry)
                        && !string.IsNullOrEmpty(PemberiPostcode)
                        && !string.IsNullOrEmpty(PenerimaContactPerson) && !string.IsNullOrEmpty(PenerimaEmail)
                        && !string.IsNullOrEmpty(PenerimaContactNumber) && !string.IsNullOrEmpty(PenerimaAddress1)
                        && !string.IsNullOrEmpty(PenerimaAddress2) && !string.IsNullOrEmpty(PenerimaCity)
                        && !string.IsNullOrEmpty(PenerimaState) && !string.IsNullOrEmpty(PenerimaCountry)
                        && !string.IsNullOrEmpty(PenerimaPostcode)
                        && !string.IsNullOrEmpty(ProdukWeight) && !string.IsNullOrEmpty(ProdukWidth)
                        && !string.IsNullOrEmpty(ProdukLength) && !string.IsNullOrEmpty(ProdukHeigth)
                        && !string.IsNullOrEmpty(ProdukDescription);

                    allRequired = !string.IsNullOrEmpty(PemberiContactPerson) || !string.IsNullOrEmpty(PemberiEmail)
                        || !string.IsNullOrEmpty(PemberiContactNumber) || !string.IsNullOrEmpty(PemberiAddress1)
                        || !string.IsNullOrEmpty(PemberiAddress2) || !string.IsNullOrEmpty(PemberiCity)
                        || !string.IsNullOrEmpty(PemberiState) || !string.IsNullOrEmpty(PemberiCountry)
                        || !string.IsNullOrEmpty(PemberiPostcode)
                        || !string.IsNullOrEmpty(PenerimaContactPerson) || !string.IsNullOrEmpty(PenerimaEmail)
                        || !string.IsNullOrEmpty(PenerimaContactNumber) || !string.IsNullOrEmpty(PenerimaAddress1)
                        || !string.IsNullOrEmpty(PenerimaAddress2) || !string.IsNullOrEmpty(PenerimaCity)
                        || !string.IsNullOrEmpty(PenerimaState) || !string.IsNullOrEmpty(PenerimaCountry)
                        || !string.IsNullOrEmpty(PenerimaPostcode)
                        || !string.IsNullOrEmpty(ProdukWeight) || !string.IsNullOrEmpty(ProdukWidth)
                        || !string.IsNullOrEmpty(ProdukLength) || !string.IsNullOrEmpty(ProdukHeigth)
                        || !string.IsNullOrEmpty(ProdukDescription);

                    while (hasRow && allRequired)
                    {
                        var consignment = new Consignment();

                        consignment.WebId = Guid.NewGuid().ToString();

                        // assign sender information
                        consignment.Pemberi.ContactPerson = PemberiContactPerson;
                        consignment.Pemberi.CompanyName = ws.Cells[$"B{row}"].GetValue<string>();
                        consignment.Pemberi.ContactInformation.Email = PemberiEmail;
                        consignment.Pemberi.ContactInformation.ContactNumber = PemberiContactNumber;
                        consignment.Pemberi.ContactInformation.AlternativeContactNumber = ws.Cells[$"E{row}"].GetValue<string>();
                        consignment.Pemberi.Address.Address1 = PemberiAddress1;
                        consignment.Pemberi.Address.Address2 = PemberiAddress2;
                        consignment.Pemberi.Address.Address3 = ws.Cells[$"H{row}"].GetValue<string>();
                        consignment.Pemberi.Address.Address4 = ws.Cells[$"I{row}"].GetValue<string>();
                        consignment.Pemberi.Address.City = PemberiCity;
                        consignment.Pemberi.Address.State = PemberiState;
                        consignment.Pemberi.Address.Country = PemberiCountry;
                        consignment.Pemberi.Address.Postcode = PemberiPostcode;

                        // assign receiver information
                        consignment.Penerima.ContactPerson = PenerimaContactPerson;
                        consignment.Penerima.CompanyName = ws.Cells[$"O{row}"].GetValue<string>();
                        consignment.Penerima.ContactInformation.Email = PenerimaEmail;
                        consignment.Penerima.ContactInformation.ContactNumber = PenerimaContactNumber;
                        consignment.Penerima.ContactInformation.AlternativeContactNumber = ws.Cells[$"R{row}"].GetValue<string>();
                        consignment.Penerima.Address.Address1 = PenerimaAddress1;
                        consignment.Penerima.Address.Address2 = PenerimaAddress2;
                        consignment.Penerima.Address.Address3 = ws.Cells[$"U{row}"].GetValue<string>();
                        consignment.Penerima.Address.Address4 = ws.Cells[$"V{row}"].GetValue<string>();
                        consignment.Penerima.Address.City = PenerimaCity;
                        consignment.Penerima.Address.State = PenerimaState;
                        consignment.Penerima.Address.Country = PenerimaCountry;
                        consignment.Penerima.Address.Postcode = (consignment.Penerima.Address.Country == "MY") ? Regex.Replace(PenerimaPostcode, @"\D", "") : PenerimaPostcode;

                        // assign product information
                        consignment.Produk.Weight = Convert.ToDecimal(ProdukWeight, CultureInfo.InvariantCulture);
                        consignment.Produk.Width = Convert.ToDecimal(ProdukWidth, CultureInfo.InvariantCulture);
                        consignment.Produk.Length = Convert.ToDecimal(ProdukLength, CultureInfo.InvariantCulture);
                        consignment.Produk.Height = Convert.ToDecimal(ProdukHeigth, CultureInfo.InvariantCulture);
                        consignment.Produk.Description = ProdukDescription;

                        if (consignment.Penerima.Address.Country == "MY")
                        {
                            if (consignment.Produk.Weight >= 0.001m && consignment.Produk.Weight <= 2m)
                            {
                                consignment.Produk.ItemCategory = "01";
                            }
                            else if (consignment.Produk.Weight >= 2.001m && consignment.Produk.Weight <= 999.999m)
                            {
                                consignment.Produk.ItemCategory = "02";
                            }
                        }
                        else
                        {
                            if (consignment.Produk.Weight <= 1m)
                            {
                                consignment.Produk.ItemCategory = "01";
                            }
                            else if (consignment.Produk.Weight >= 0.001m && consignment.Produk.Weight <= 30m)
                            {
                                consignment.Produk.ItemCategory = "02";
                            }
                        }
                        consignment.Produk.IsInternational = (consignment.Penerima.Address.Country == "MY") ? false : true;

                        if (item.Designation == "Contract customer" && !consignment.Produk.IsInternational)
                        {
                            consignment.Produk.Est.ShipperReferenceNo = ws.Cells[$"AH{row}"].GetValue<string>();
                            consignment.Produk.Est.ReceiverReferenceNo = ws.Cells[$"AI{row}"].GetValue<string>();

                            var productEstCod = ws.Cells[$"AF{row}"].GetValue<string>();
                            if (!string.IsNullOrEmpty(productEstCod))
                            {
                                decimal number;
                                if (Decimal.TryParse(productEstCod, out number))
                                {
                                    consignment.Produk.Est.CodAmount = number;
                                }
                            }
                            var productEstCcod = ws.Cells[$"AG{row}"].GetValue<string>();
                            if (!string.IsNullOrEmpty(productEstCcod) && consignment.Produk.Est.CodAmount == 0)
                            {
                                decimal number;
                                if (Decimal.TryParse(productEstCcod, out number))
                                {
                                    consignment.Produk.Est.CcodAmount = number;
                                }
                            }
                        }

                        row++;

                        PemberiContactPerson = ws.Cells[$"A{row}"].GetValue<string>();
                        PemberiEmail = ws.Cells[$"C{row}"].GetValue<string>();
                        PemberiContactNumber = ws.Cells[$"D{row}"].GetValue<string>();
                        PemberiAddress1 = ws.Cells[$"F{row}"].GetValue<string>();
                        PemberiAddress2 = ws.Cells[$"G{row}"].GetValue<string>();
                        PemberiCity = ws.Cells[$"J{row}"].GetValue<string>();
                        PemberiState = ws.Cells[$"K{row}"].GetValue<string>();
                        PemberiCountry = ws.Cells[$"L{row}"].GetValue<string>();
                        PemberiPostcode = ws.Cells[$"M{row}"].GetValue<string>();
                        PenerimaContactPerson = ws.Cells[$"N{row}"].GetValue<string>();
                        PenerimaEmail = ws.Cells[$"P{row}"].GetValue<string>();
                        PenerimaContactNumber = ws.Cells[$"Q{row}"].GetValue<string>();
                        PenerimaAddress1 = ws.Cells[$"S{row}"].GetValue<string>();
                        PenerimaAddress2 = ws.Cells[$"T{row}"].GetValue<string>();
                        PenerimaCity = ws.Cells[$"W{row}"].GetValue<string>();
                        PenerimaState = ws.Cells[$"X{row}"].GetValue<string>();
                        PenerimaCountry = ws.Cells[$"Y{row}"].GetValue<string>();
                        PenerimaPostcode = ws.Cells[$"Z{row}"].GetValue<string>();
                        ProdukWeight = ws.Cells[$"AA{row}"].GetValue<string>();
                        ProdukWidth = ws.Cells[$"AB{row}"].GetValue<string>();
                        ProdukLength = ws.Cells[$"AC{row}"].GetValue<string>();
                        ProdukHeigth = ws.Cells[$"AD{row}"].GetValue<string>();
                        ProdukDescription = ws.Cells[$"AE{row}"].GetValue<string>();

                        hasRow = !string.IsNullOrEmpty(PemberiContactPerson) && !string.IsNullOrEmpty(PemberiEmail)
                            && !string.IsNullOrEmpty(PemberiContactNumber) && !string.IsNullOrEmpty(PemberiAddress1)
                            && !string.IsNullOrEmpty(PemberiAddress2) && !string.IsNullOrEmpty(PemberiCity)
                            && !string.IsNullOrEmpty(PemberiState) && !string.IsNullOrEmpty(PemberiCountry)
                            && !string.IsNullOrEmpty(PemberiPostcode)
                            && !string.IsNullOrEmpty(PenerimaContactPerson) && !string.IsNullOrEmpty(PenerimaEmail)
                            && !string.IsNullOrEmpty(PenerimaContactNumber) && !string.IsNullOrEmpty(PenerimaAddress1)
                            && !string.IsNullOrEmpty(PenerimaAddress2) && !string.IsNullOrEmpty(PenerimaCity)
                            && !string.IsNullOrEmpty(PenerimaState) && !string.IsNullOrEmpty(PenerimaCountry)
                            && !string.IsNullOrEmpty(PenerimaPostcode)
                            && !string.IsNullOrEmpty(ProdukWeight) && !string.IsNullOrEmpty(ProdukWidth)
                            && !string.IsNullOrEmpty(ProdukLength) && !string.IsNullOrEmpty(ProdukHeigth)
                            && !string.IsNullOrEmpty(ProdukDescription);

                        allRequired = !string.IsNullOrEmpty(PemberiContactPerson) || !string.IsNullOrEmpty(PemberiEmail)
                            || !string.IsNullOrEmpty(PemberiContactNumber) || !string.IsNullOrEmpty(PemberiAddress1)
                            || !string.IsNullOrEmpty(PemberiAddress2) || !string.IsNullOrEmpty(PemberiCity)
                            || !string.IsNullOrEmpty(PemberiState) || !string.IsNullOrEmpty(PemberiCountry)
                            || !string.IsNullOrEmpty(PemberiPostcode)
                            || !string.IsNullOrEmpty(PenerimaContactPerson) || !string.IsNullOrEmpty(PenerimaEmail)
                            || !string.IsNullOrEmpty(PenerimaContactNumber) || !string.IsNullOrEmpty(PenerimaAddress1)
                            || !string.IsNullOrEmpty(PenerimaAddress2) || !string.IsNullOrEmpty(PenerimaCity)
                            || !string.IsNullOrEmpty(PenerimaState) || !string.IsNullOrEmpty(PenerimaCountry)
                            || !string.IsNullOrEmpty(PenerimaPostcode)
                            || !string.IsNullOrEmpty(ProdukWeight) || !string.IsNullOrEmpty(ProdukWidth)
                            || !string.IsNullOrEmpty(ProdukLength) || !string.IsNullOrEmpty(ProdukHeigth)
                            || !string.IsNullOrEmpty(ProdukDescription);

                        item.Consignments.Add(consignment);
                        countAddedConsignment += 1;
                    }

                    //generate new guid for versioning detection
                    item.WebId = Guid.NewGuid().ToString();
                    if (!hasRow && !allRequired)
                    {
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
                        resultStatus = $"Parcel number {countAddedConsignment + 1} has data problem.";
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
                resultStatus = "Consignment Request has been paid / already picked up";
            }

            if (!hasRow && !allRequired)
            {
                //TODO: Need to be finalized
                var dataSaved = await ConsignmentRequestSaved(item);

                if (!dataSaved)
                {
                    resultSuccess = false;
                    resultStatus = $"Worksheet Consignments in {doc.FileName}, cannot been save.";
                }
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

        private async Task<bool> ConsignmentRequestSaved(ConsigmentRequest item)
        {
            var countWhile = 0;

            while (true)
            {
                if (countWhile > 600) //600
                    break;

                //using c# stop watch decide if proses takes too long
                countWhile += 1;
                LoadData<ConsigmentRequest> cr = await GetConsigmentRequest(item.Id);
                if (null == cr.Source) break;
                var consignmentRequest = cr.Source;

                if (consignmentRequest.WebId == item.WebId)
                    break;
                else
                    await Task.Delay(200);
            }

            if (countWhile > 600)
                return false;
            else
                return true;
        }

        [HttpPost]
        [Route("export-consignments")]
        public async Task<IHttpActionResult> ExportConsignments([FromBody]List<Consignment> consignments)
        {
            var temp = Path.GetTempFileName() + ".xlsx";
            UserProfile userProfile = await GetDesignation();

            if (userProfile.Designation == "No contract customer")
                System.IO.File.Copy(System.Web.HttpContext.Current.Server.MapPath("~/Content/Files/consignment_list_format_template.xlsx"), temp, true);
            else
                System.IO.File.Copy(System.Web.HttpContext.Current.Server.MapPath("~/Content/Files/consignment_list_format_template_est.xlsx"), temp, true);

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
                    ws.Cells[row + i, 32].Value = string.Empty;
                    ws.Cells[row + i, 33].Value = string.Empty;
                    ws.Cells[row + i, 34].Value = string.Empty;
                    ws.Cells[row + i, 35].Value = string.Empty;
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

                if (userProfile.Designation == "Contract customer")
                {
                    ws.Cells[row, 32].Value = consignment.Produk.Est.CodAmount;
                    ws.Cells[row, 33].Value = consignment.Produk.Est.CcodAmount;
                    ws.Cells[row, 34].Value = consignment.Produk.Est.ShipperReferenceNo;
                    ws.Cells[row, 35].Value = consignment.Produk.Est.ReceiverReferenceNo;
                }

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
                    ws.Cells[row, 17].Value = consignment.Produk.Est.CodAmount;
                    ws.Cells[row, 18].Value = consignment.Produk.Est.CcodAmount;
                    ws.Cells[row, 19].Value = consignment.Produk.Est.ShipperReferenceNo;
                    ws.Cells[row, 20].Value = consignment.Produk.Est.ReceiverReferenceNo;
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
        [Route("export-pickup-daily/{start:datetime}/{end:datetime}/{est:bool}")]
        public async Task<IHttpActionResult> ExportPickupDaily(DateTime start, DateTime end, bool est)
        {
            var temp = Path.GetTempFileName() + ".xlsx";
            System.IO.File.Copy(System.Web.HttpContext.Current.Server.MapPath("~/Content/Files/pickup_daily_format_template.xlsx"), temp, true);

            var file = new FileInfo(temp);
            var excel = new ExcelPackage(file);
            var ws = excel.Workbook.Worksheets["branchcode"];
            if (null == ws) return Ok(new { success = false, status = "Cannot open Worksheet Pickup Manifest" });

            // TODO: implement paging logic
            var queryString = $"size=100&q=Pickup.DateReady:[\"{start.ToString("yyyy-MM-dd")}\" TO \"{end.ToString("yyyy-MM-dd")}\"]";

            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/consigment-requests/paid-all/con-note-ready/true/picked-up/false?{queryString}";
            if (est)
            {
                requestUri = $"{m_ostBaseUrl.BaseAddress}/api/consigment-requests/pickup-daily-list-for-est?{queryString}";
            }
            var response = await m_ostBaseUrl.GetAsync(requestUri);

            var output = string.Empty;
            if (response.IsSuccessStatusCode) output = await response.Content.ReadAsStringAsync();
            else return Ok(new { success = false, status = $"RequestUri:{requestUri.ToString()} Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}" });

            var json = JObject.Parse(output).SelectToken("$._results");
            var consignmentRequests = new List<ConsigmentRequest>();
            foreach (var jtok in json)
            {
                var consignmentRequest = jtok.ToJson().DeserializeFromJson<ConsigmentRequest>();
                if (est)
                {
                    if (consignmentRequest.Pickup.Number != null)
                    {
                        consignmentRequests.Add(consignmentRequest);
                    }
                }
                else
                {
                    consignmentRequests.Add(consignmentRequest);
                }
            }

            var row = 7;
            var consignmentIndexNumber = 1;

            foreach (var consignmentRequest in consignmentRequests)
            {
                foreach (var consignment in consignmentRequest.Consignments)
                {
                    if (consignment.ConNote != null)
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
        [Route("get-total-consignment/{id}")]
        public async Task<IHttpActionResult> GetTotalConsignmentAsync(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return Ok(new { success = false, status = "FAIL" });
            var item = lo.Source;
            return Ok(new { success = true, status = "OK", id = item.Id, totalConsignment = $"{item.Consignments.Count()}" });
        }

        [HttpGet]
        [Route("calculate-gst/{value}/{rounded}")]
        public IHttpActionResult CalculateGst(decimal value = 0.00m, int rounded = 2)
        {
            decimal gstValue = GstCalculation(value, rounded);
            return Ok(gstValue);
        }

        [HttpPut]
        [Route("get-and-save-routing-code/{id}")]
        public async Task<IHttpActionResult> GetAndSaveRoutingCode(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);
            var item = lo.Source;

            var resultStatus = "OK";
            var resultSuccess = true;

            if (item.Consignments.Count == 0)
            {
                resultSuccess = false;
                resultStatus = "Consignment not found";
            }

            if (resultSuccess)
            {
                foreach (var consignment in item.Consignments)
                {
                    if (consignment.Bill.RoutingCode == null && !consignment.Produk.IsInternational)
                    {
                        string newOriginRoutingCode;
                        var originRoutingCode = await GetRoutingCode(item.Pickup.Address.Postcode);
                        if (!string.IsNullOrEmpty(originRoutingCode))
                        {
                            newOriginRoutingCode = originRoutingCode.Substring(5, 3);

                            var destinationRoutingCode = await GetRoutingCode(consignment.Penerima.Address.Postcode);
                            if (!string.IsNullOrEmpty(destinationRoutingCode))
                            {
                                consignment.Bill.RoutingCode = $"{newOriginRoutingCode} - {destinationRoutingCode}";
                            }
                        }
                    }
                }

                await SaveConsigmentRequest(item);
            }

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = item.Id,
            };

            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpPost]
        [Route("custom-search")]
        public async Task<IHttpActionResult> CustomSearch([RawBody]string query,
                            [FromUri(Name = "q")]string q = null,
                            [FromUri(Name = "page")]int page = 1,
                            [FromUri(Name = "size")]int size = 20)
        {
            var queryString = $"from={size * (page - 1)}&size={size}";
            if (!string.IsNullOrWhiteSpace(q))
                queryString += $"&q={q}";

            var repos = ObjectBuilder.GetObject<IReadonlyRepository<ConsigmentRequest>>();
            var response = await repos.SearchAsync(query, queryString);
            var json = JObject.Parse(response);
            var count = json.SelectToken("$.hits.total").Value<int>();

            var list = from f in json.SelectToken("$.hits.hits")
                       let webId = f.SelectToken("_source.WebId").Value<string>()
                       let id = f.SelectToken("_id").Value<string>()
                       let link = $"\"link\" :{{ \"href\" :\"{ConfigurationManager.BaseUrl}/api/consigment-requests/{id}\"}}"
                       select f.SelectToken("_source").ToString().Replace($"{webId}\"", $"{webId}\"," + link);

            var links = new List<object>();
            var nextLink = new
            {
                method = "GET",
                rel = "next",
                href = $"{ConfigurationManager.BaseUrl}/consignment-request/search/?page={page + 1}&size={size}",
                desc = "Issue a GET request to get the next page of the result"
            };
            var previousLink = new
            {
                method = "GET",
                rel = "previous",
                href = $"{ConfigurationManager.BaseUrl}/consignment-request/search/?page={page - 1}&size={size}",
                desc = "Issue a GET request to get the previous page of the result"
            };
            var hasNextPage = count > size * page;
            var hasPreviousPage = page > 1;
            if (hasPreviousPage)
            {
                links.Add(previousLink);
            }
            if (hasNextPage)
            {
                links.Add(nextLink);

            }

            var result = new
            {
                _results = list.Select(x => JObject.Parse(x)),
                _count = json.SelectToken("$.hits.total").Value<int>(),
                _page = page,
                _links = links.ToArray(),
                _size = size
            };

            return Ok(result);
        }

        private void AssignDomesticConnotes(ConsigmentRequest consignmentRequest, int numberOfConnote, ref bool resultSuccess, ref string resultStatus)
        {
            var orderId = GenerateOrderId(consignmentRequest);
            var sdsConnotesDomestic = GetConnotes(orderId, numberOfConnote, ConnotePrefixType.Domestic);
            if (sdsConnotesDomestic.StatusCode == "01")
            {
                if (sdsConnotesDomestic.ConnoteNumbers.Count >= numberOfConnote)
                {
                    var sdsCounterDomestic = 0;
                    foreach (var consignment in consignmentRequest.Consignments)
                    {
                        if (consignment.ConNote == null && !consignment.Produk.IsInternational
                            && consignment.Produk.Est.CodAmount == 0 && consignment.Produk.Est.CcodAmount == 0)
                        {
                            consignment.ConNote = sdsConnotesDomestic.ConnoteNumbers[sdsCounterDomestic];
                            sdsCounterDomestic++;
                        }
                    }
                    consignmentRequest.ReferenceNo = orderId;
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
                resultStatus = "StatusCode: " + sdsConnotesDomestic.StatusCode + " Message: " + sdsConnotesDomestic.Message;
            }
        }

        private void AssignInternationalConnotes(ConsigmentRequest consignmentRequest, int numberOfConnote, ref bool resultSuccess, ref string resultStatus)
        {
            var orderId = GenerateOrderId(consignmentRequest);
            var sdsConnotesInternational = GetConnotes(orderId, numberOfConnote, ConnotePrefixType.International);
            if (sdsConnotesInternational.StatusCode == "01")
            {
                if (sdsConnotesInternational.ConnoteNumbers.Count >= numberOfConnote)
                {
                    var sdsCounterInternational = 0;
                    foreach (var consignment in consignmentRequest.Consignments)
                    {
                        if (consignment.ConNote == null && consignment.Produk.IsInternational)
                        {
                            consignment.ConNote = sdsConnotesInternational.ConnoteNumbers[sdsCounterInternational];
                            sdsCounterInternational++;
                        }
                    }
                    consignmentRequest.ReferenceNo = orderId;
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
                resultStatus = "StatusCode: " + sdsConnotesInternational.StatusCode + " Message: " + sdsConnotesInternational.Message;
            }
        }

        private void AssignCodCcodConnotes(ConsigmentRequest consignmentRequest, int numberOfConnote, ref bool resultSuccess, ref string resultStatus)
        {
            var orderId = GenerateOrderId(consignmentRequest);
            var sdsConnotesCodCCod = GetConnotes(orderId, numberOfConnote, ConnotePrefixType.CodCcod);
            if (sdsConnotesCodCCod.StatusCode == "01")
            {
                if (sdsConnotesCodCCod.ConnoteNumbers.Count >= numberOfConnote)
                {
                    var sdsCounterDomestic = 0;
                    foreach (var consignment in consignmentRequest.Consignments)
                    {
                        if (consignment.ConNote == null)
                        {
                            if (consignment.Produk.Est.CodAmount > 0 || consignment.Produk.Est.CcodAmount > 0)
                            {
                                consignment.ConNote = sdsConnotesCodCCod.ConnoteNumbers[sdsCounterDomestic];
                                sdsCounterDomestic++;
                            }
                        }
                    }
                    consignmentRequest.ReferenceNo = orderId;
                }
                else
                {
                    resultSuccess = false;
                    resultStatus = "Generated consignment note for cod / ccod not enough";
                }
            }
            else
            {
                resultSuccess = false;
                resultStatus = "StatusCode: " + sdsConnotesCodCCod.StatusCode + " Message: " + sdsConnotesCodCCod.Message;
            }
        }

        private static async Task<PosLajuBranch> GetBranch(int postcode)
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
                    PostcodeParent = (string)jObject["PostcodeParent"],
                    Email = (string)jObject["Email"],
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
            return branch;
        }

        public async Task<string> GetRoutingCode(string postCode)
        {
            var routingCode = string.Empty;
            var requestUri = $"{m_clientBromApi.BaseAddress}/branches/postcode/{postCode}/routing-code/";
            var response = await m_clientBromApi.GetAsync(requestUri);
            if (response.IsSuccessStatusCode)
            {
                var output = await response.Content.ReadAsStringAsync();
                routingCode = JObject.Parse(output).SelectToken("$.RouteCode").ToString();
            }
            return routingCode;
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
            int rndTail = rnd.Next(1, 9999999);

            if (isValid || !item.ReferenceNo.Contains(m_applicationName.ToUpper()))
            {
                var referenceNo = new StringBuilder();
                referenceNo.Append($"{m_applicationName.ToUpper()}-");
                referenceNo.Append(DateTime.Now.ToString("ddMMyy-"));
                referenceNo.Append(rndTail.ToString("D7") + "-");
                referenceNo.Append((item.ReferenceNo.Split('-'))[1]);
                orderId = referenceNo.ToString();
            }
            else
            {
                var arrOrderId = orderId.Split('-');
                orderId = arrOrderId[0] + "-" + arrOrderId[1] + "-" + rndTail.ToString() + "-" + arrOrderId[3];
            }
            return orderId;
        }

        private SdsConnote GetConnotes(string orderId, int numberOfConnote, ConnotePrefixType connotePrefixType)
        {
            m_sdsBaseUrl.DefaultRequestHeaders.Clear();
            m_sdsBaseUrl.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_GenerateConnote);
            var url = new StringBuilder();
            url.Append(m_sdsApi_GenerateConnote);

            if (connotePrefixType == ConnotePrefixType.Domestic) url.Append("?Prefix=EU");
            else if (connotePrefixType == ConnotePrefixType.International) url.Append("?Prefix=EQ");
            else if (connotePrefixType == ConnotePrefixType.CodCcod) url.Append("?Prefix=EC");

            url.Append("&ApplicationCode=OST");
            url.Append("&Secretid=ost@1234");
            url.Append("&username=entt.ost");
            url.Append($"&numberOfItem={numberOfConnote}");
            url.Append($"&Orderid={orderId}");

            var output = m_sdsBaseUrl.GetStringAsync($"{m_sdsBaseUrl.BaseAddress}/{url.ToString()}").Result;

            var json = JObject.Parse(output);
            var sdsConnote = new SdsConnote(json);
            return sdsConnote;
        }
    }

    public class SdsConnote
    {
        public SdsConnote(JObject json)
        {
            if (json.SelectToken("$.StatusCode") == null)
            {
                StatusCode = "error";
            }
            else
            {
                StatusCode = json.SelectToken("$.StatusCode").Value<string>();
                ConnoteNumbers = json.SelectToken("$.ConnoteNo").Value<string>().Split('|').ToList();
                Message = json.SelectToken("$.Message").Value<string>();
            }
        }

        public string StatusCode { get; set; }
        public List<string> ConnoteNumbers { get; set; }
        public string Message { get; set; }
    }

    public class SdsPickup
    {
        public SdsPickup(JObject json)
        {
            if (json.SelectToken("$.StatusCode") == null)
            {
                StatusCode = "error";
            }
            else
            {
                StatusCode = json.SelectToken("$.StatusCode").Value<string>();
                PickupNumber = json.SelectToken("$.pickupNumber").Value<string>();
                Message = (json.SelectToken("$.Message") == null) ? string.Empty : json.SelectToken("$.Message").Value<string>();
            }
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