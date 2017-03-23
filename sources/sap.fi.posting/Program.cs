﻿using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using FileHelpers;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace sap.fi.posting
{
    class Program
    {
        private string m_ostBaseUrl;
        private string m_ostAdminToken;
        private string m_ostSapFolder;

        public Program()
        {
            m_ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://ost.pos.com.my";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI";
            m_ostSapFolder = ConfigurationManager.GetEnvironmentVariable("SapFolder") ?? @"C:\temp";
        }

        static void Main(string[] args)
        {
            var startDate = string.Empty;
            var endDate = string.Empty;
            var maxRecord = string.Empty;
            if (args.Length < 3)
            {
                startDate = $"{DateTime.Today:yyyy-MM-dd}";
                endDate = $"{DateTime.Today.AddDays(1):yyyy-MM-dd}";
                maxRecord = "500";
            }

            try
            {
                var program = new Program();
                program.RunAsync(startDate, endDate, maxRecord).Wait();
                Console.WriteLine("Done ......");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }

        public async Task RunAsync(string startDate, string endDate, string maxRecord)
        {

            var engine = new FileHelperEngine<SapFiDelimited>();
            var sapFiFile = new List<SapFiDelimited>();
            var consigmentRequests = new List<ConsigmentRequest>();

            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
            var requestUri = new Uri($"{m_ostBaseUrl}/api/consigment-requests/paid-within-range/{startDate}/{endDate}/?size={maxRecord}");
            var response = await client.GetAsync(requestUri);

            var output = string.Empty;
            if (response.IsSuccessStatusCode)
            {
                output = await response.Content.ReadAsStringAsync();
            }
            else
            {
                return;
            }

            var json = JObject.Parse(output).SelectToken("_results");
            foreach (var jtok in json)
            {
                var consigmentRequest = jtok.ToJson().DeserializeFromJson<ConsigmentRequest>();
                consigmentRequests.Add(consigmentRequest);
            }

            int sequenceNumberCount = 1;
            foreach (var consigmentRequest in consigmentRequests)
            {
                decimal domesticGrandTotal = 0;
                decimal domesticBaseRateTotal = 0;
                decimal domesticHandlingSurchargeTotal = 0;
                decimal domesticFuelSurchargeTotal = 0;
                decimal domesticGstTotal = 0;
                decimal domesticInsuranceTotal = 0;
                int domesticProductCount = 0;
                int domesticInsuranceProductCount = 0;

                decimal internationalGrandTotal = 0;
                decimal internationalBaseRateTotal = 0;
                decimal internationalHandlingSurchargeTotal = 0;
                decimal internationalFuelSurchargeTotal = 0;
                decimal internationalGstTotal = 0;
                decimal internationalInsuranceTotal = 0;
                int internationalProductCount = 0;
                int internationalInsuranceProductCount = 0;

                foreach (var consigment in consigmentRequest.Consignments)
                {
                    if (consigment.Produk.IsInternational)
                    {
                        internationalGrandTotal += consigment.Bill.Total;
                        internationalBaseRateTotal += consigment.Bill.BaseRate;
                        internationalProductCount += 1;
                    }
                    else
                    {
                        domesticGrandTotal += consigment.Bill.Total;
                        domesticBaseRateTotal += consigment.Bill.BaseRate;
                        domesticProductCount += 1;
                    }
                    foreach (var c in consigment.Bill.AddOnsC)
                    {
                        if (consigment.Produk.IsInternational)
                        {
                            if (c.Code.Equals("S04") || c.Name.Equals("International Fuel Surcharge"))
                            {
                                internationalFuelSurchargeTotal += c.Charge;
                            }
                            if (c.Code.Equals("S06") || c.Name.Equals("International Handling Surcharge"))
                            {
                                internationalHandlingSurchargeTotal += c.Charge;
                            }
                        }
                        else
                        {
                            if (c.Code.Equals("S03") || c.Name.Equals("Domestic Fuel Surcharge"))
                            {
                                domesticFuelSurchargeTotal += c.Charge;
                            }
                            if (c.Code.Equals("S05") || c.Name.Equals("Domestic Handling Surcharge"))
                            {
                                domesticHandlingSurchargeTotal += c.Charge;
                            }
                        }

                    }
                    foreach (var d in consigment.Bill.AddOnsD)
                    {
                        if (consigment.Produk.IsInternational)
                        {
                            if (d.Code.Equals("S02") || d.Name.Equals("GST Output Tax - Cus"))
                            {
                                internationalGstTotal += d.Charge;
                            }
                        }
                        else
                        {
                            if (d.Code.Equals("S01") || d.Name.Equals("GST Output Tax - Cus"))
                            {
                                domesticGstTotal += d.Charge;
                            }
                        }

                    }
                    foreach (var a in consigment.Bill.AddOnsA)
                    {
                        if (consigment.Produk.IsInternational)
                        {
                            if (a.Code.Equals("V01") || a.Name.Equals("Insurance PosLaju-Normal "))
                            {
                                internationalInsuranceTotal += a.Charge;
                                internationalInsuranceProductCount += 1;
                            }
                        }
                        else
                        {
                            if (a.Code.Equals("V01") || a.Name.Equals("Insurance PosLaju-Normal "))
                            {
                                domesticInsuranceTotal += a.Charge;
                                domesticInsuranceProductCount += 1;
                            }
                        }

                    }
                }

                var domesticAndInternationalProductTotal = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = consigmentRequest.ReferenceNo,
                    PostingKey = "40",
                    AccountNumber = "620301",
                    Amount = domesticGrandTotal + internationalGrandTotal,
                    CostCenter = "11523002",
                    Quantity = domesticProductCount + internationalProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    Text = string.Empty,
                    ReferenceKey = "-",
                    SequenceNumber = sequenceNumberCount
                };
                var domesticProductBaseRateAndHandlingSurcharge = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = consigmentRequest.ReferenceNo,
                    PostingKey = "50",
                    AccountNumber = "620101",
                    Amount = domesticBaseRateTotal + domesticHandlingSurchargeTotal,
                    CostCenter = "11523002",
                    Quantity = domesticProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    Text = "1 00000 Next Day Delivery (NDD)",
                    ReferenceKey = "-",
                    SequenceNumber = sequenceNumberCount
                };
                var domesticProductFuelSurcharge = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = consigmentRequest.ReferenceNo,
                    PostingKey = "50",
                    AccountNumber = "620401",
                    Amount = domesticFuelSurchargeTotal,
                    CostCenter = "11523002",
                    Quantity = domesticProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    Text = "1 00000 Domestic Fuel Surcharge",
                    ReferenceKey = "-",
                    SequenceNumber = sequenceNumberCount
                };
                var domesticAndInternationalProductInsurance = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = consigmentRequest.ReferenceNo,
                    PostingKey = "50",
                    AccountNumber = "515922",
                    Amount = domesticInsuranceTotal + internationalInsuranceTotal,
                    CostCenter = "11523002",
                    Quantity = domesticInsuranceProductCount + internationalInsuranceProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    Text = "1 00000 Insurance PosLaju-Normal",
                    ReferenceKey = "-",
                    SequenceNumber = sequenceNumberCount
                };
                var domesticProductGst = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = consigmentRequest.ReferenceNo,
                    PostingKey = "50",
                    AccountNumber = "542402",
                    Amount = domesticGstTotal,
                    CostCenter = "11523002",
                    Quantity = domesticProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    Text = "1 00000 GST Output Tax - Cus",
                    ReferenceKey = "-",
                    SequenceNumber = sequenceNumberCount
                };
                var internationalProductBaseRateAndHandlingSurcharge = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = consigmentRequest.ReferenceNo,
                    PostingKey = "50",
                    AccountNumber = "620103",
                    Amount = internationalBaseRateTotal + internationalHandlingSurchargeTotal,
                    CostCenter = "11523002",
                    Quantity = internationalProductCount,
                    TaxCode = "ZR",
                    Assignment = consigmentRequest.ReferenceNo,
                    Text = "1 00000 Express Mail Service (EMS)",
                    ReferenceKey = "-",
                    SequenceNumber = sequenceNumberCount
                };
                var internationalProductFuelSurcharge = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = consigmentRequest.ReferenceNo,
                    PostingKey = "50",
                    AccountNumber = "620403",
                    Amount = internationalFuelSurchargeTotal,
                    CostCenter = "11523002",
                    Quantity = internationalProductCount,
                    TaxCode = "ZR",
                    Assignment = consigmentRequest.ReferenceNo,
                    Text = "1 00000 International Fuel Surcharge",
                    ReferenceKey = "-",
                    SequenceNumber = sequenceNumberCount
                };

                sapFiFile.Add(domesticAndInternationalProductTotal);
                sapFiFile.Add(domesticProductBaseRateAndHandlingSurcharge);
                sapFiFile.Add(domesticProductFuelSurcharge);
                sapFiFile.Add(internationalProductBaseRateAndHandlingSurcharge);
                sapFiFile.Add(internationalProductFuelSurcharge);
                sapFiFile.Add(domesticAndInternationalProductInsurance);
                sapFiFile.Add(domesticProductGst);

                sequenceNumberCount++;
            }

            var path = $@"{m_ostSapFolder}\OST_CACC_HQ_{DateTime.Now:yyyyMMdd-HHmmss}.txt";
            engine.WriteFile(path, sapFiFile);
            using (StreamWriter sw = File.AppendText(path))
            {
                sw.WriteLine("EOF");
            }
        }
    }
}
