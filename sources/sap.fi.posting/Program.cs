using Bespoke.Ost.ConsigmentRequests.Domain;
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
            m_ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";
            m_ostSapFolder = ConfigurationManager.GetEnvironmentVariable("SapFolder") ?? @"C:\temp";
        }

        static void Main(string[] args)
        {
            var startDate = string.Empty;
            var endDate = string.Empty;
            if (args.Length < 2)
            {
                startDate = $"{DateTime.Today.AddDays(-1):yyyy-MM-dd}";
                endDate = $"{DateTime.Today:yyyy-MM-dd}";
            }
            else
            {
                startDate = args[0];
                endDate = args[1];
            }

            try
            {
                var program = new Program();
                program.RunAsync(startDate, endDate).Wait();
                Console.WriteLine("Done ......");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }

        public async Task RunAsync(string startDate, string endDate)
        {

            var engine = new FileHelperEngine<SapFiDelimited>();
            var sapFiFile = new List<SapFiDelimited>();
            var consigmentRequests = new List<ConsigmentRequest>();

            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            bool requestInvoice = true;
            int invoiceCount = 0;
            int invoicePage = 1;
            int invoiceSize = 20;

            while (requestInvoice)
            {
                var requestUri = new Uri($"{m_ostBaseUrl}/api/consigment-requests/paid-all-within-range/{startDate}/{endDate}/?size={invoiceSize}&page={invoicePage}");
                var response = await client.GetAsync(requestUri);
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
                    return;
                }

                var json = JObject.Parse(output).SelectToken("_results");
                foreach (var jtok in json)
                {
                    var consigmentRequest = jtok.ToJson().DeserializeFromJson<ConsigmentRequest>();
                    consigmentRequests.Add(consigmentRequest);
                }
                Console.WriteLine($"Invoice count: {consigmentRequests.Count} .....");

                invoiceCount = JObject.Parse(output).SelectToken("_count").Value<int>();
                invoicePage = JObject.Parse(output).SelectToken("_page").Value<int>();
                invoiceSize = JObject.Parse(output).SelectToken("_size").Value<int>();
                if ((invoicePage * invoiceSize) >= invoiceCount)
                {
                    requestInvoice = false;
                }
                invoicePage++;
            }

            int sequenceNumberCount = 1;
            foreach (var consigmentRequest in consigmentRequests)
            {
                decimal domesticGrandTotal = 0;
                decimal domesticSubTotal = 0;
                decimal domesticBaseRateTotal = 0;
                decimal domesticHandlingSurchargeTotal = 0;
                decimal domesticFuelSurchargeTotal = 0;
                decimal domesticGstTotal = 0;
                decimal domesticInsuranceTotal = 0;
                int domesticProductCount = 0;
                int domesticInsuranceProductCount = 0;

                decimal internationalGrandTotal = 0;
                decimal internationalSubTotal = 0;
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
                        internationalSubTotal += consigment.Bill.SubTotal3; ;
                        internationalBaseRateTotal += consigment.Bill.BaseRate;
                        internationalProductCount += 1;
                    }
                    else
                    {
                        domesticGrandTotal += consigment.Bill.Total;
                        domesticSubTotal += consigment.Bill.SubTotal3;
                        domesticBaseRateTotal += consigment.Bill.BaseRate;
                        domesticProductCount += 1;
                    }
                    foreach (var c in consigment.Bill.AddOnsC)
                    {
                        if (consigment.Produk.IsInternational)
                        {
                            if (c.Code.Equals("S13") || c.Name.Equals("International Fuel Surcharge - OD"))
                            {
                                internationalFuelSurchargeTotal += c.Charge;
                            }
                            if (c.Code.Equals("S14") || c.Name.Equals("International Handling Surcharge - OD"))
                            {
                                internationalHandlingSurchargeTotal += c.Charge;
                            }
                        }
                        else
                        {
                            if (c.Code.Equals("S12") || c.Name.Equals("Domestic Fuel Surcharge - OD"))
                            {
                                domesticFuelSurchargeTotal += c.Charge;
                            }
                            if (c.Code.Equals("S11") || c.Name.Equals("Domestic Handling Surcharge - OD"))
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
                            if (a.Code.Equals("V29") || a.Name.Equals("Ezisend Insurance - General"))
                            {
                                internationalInsuranceTotal += a.Charge;
                                internationalInsuranceProductCount += 1;
                            }
                        }
                        else
                        {
                            if (a.Code.Equals("V29") || a.Name.Equals("Ezisend Insurance - General"))
                            {
                                domesticInsuranceTotal += a.Charge;
                                domesticInsuranceProductCount += 1;
                            }
                        }

                    }
                }

                //Locally calculate GST to avoid rounding #6275
                domesticGstTotal = GstCalculation(domesticSubTotal, 2);
                internationalGstTotal = 0;

                decimal pickupCharge = 5.00m;
                decimal pickupChargeGst = Decimal.Multiply(pickupCharge, 0.06m);

                var domesticAndInternationalProductTotal = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = string.Empty,
                    PostingKey = "40",
                    AccountNumber = "273608",
                    //Amount = domesticGrandTotal + internationalGrandTotal + pickupCharge + pickupChargeGst, //Locally calculate GST to avoid rounding #6275
                    Amount = domesticSubTotal + domesticGstTotal + internationalSubTotal + internationalGstTotal + pickupCharge + pickupChargeGst,
                    CostCenter = "11523003",
                    Quantity = domesticProductCount + internationalProductCount,
                    TaxCode = "OS",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "MP00003",
                    Text = "1RHB Online",
                    SequenceNumber = sequenceNumberCount
                };
                var domesticAndInternationalPickupTotal = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "620301",
                    Amount = pickupCharge,
                    CostCenter = "11523003",
                    Quantity = domesticProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "C305101",
                    Text = "1Courier Pickup Service",
                    SequenceNumber = sequenceNumberCount
                };
                var domesticProductBaseRate = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "620102",
                    Amount = domesticBaseRateTotal,
                    CostCenter = "11523003",
                    Quantity = domesticProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "C001101",
                    Text = "1Next Day Delivery (NDD)",
                    SequenceNumber = sequenceNumberCount
                };
                var domesticProductHandlingSurcharge = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "620102",
                    Amount = domesticHandlingSurchargeTotal,
                    CostCenter = "11523003",
                    Quantity = domesticProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "C501101",
                    Text = "1Domestic Handling Surcharge - OD",
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
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "620402",
                    Amount = domesticFuelSurchargeTotal,
                    CostCenter = "11523003",
                    Quantity = domesticProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "C500101",
                    Text = "1Domestic Fuel Surcharge - OD",
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
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "515921",
                    Amount = domesticInsuranceTotal + internationalInsuranceTotal,
                    CostCenter = "11523003",
                    Quantity = domesticInsuranceProductCount + internationalInsuranceProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "C306102",
                    Text = "1Ezisend Insurance - General",
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
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "542402",
                    Amount = domesticGstTotal + pickupChargeGst,
                    CostCenter = "11523003",
                    Quantity = domesticProductCount,
                    TaxCode = "SR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "GSTS102",
                    Text = "1GST Output Tax - Cus",
                    SequenceNumber = sequenceNumberCount
                };
                var internationalProductBaseRate = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "620104",
                    Amount = internationalBaseRateTotal,
                    CostCenter = "11523003",
                    Quantity = internationalProductCount,
                    TaxCode = "ZR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "C002101",
                    Text = "1Express Mail Service (EMS)",
                    SequenceNumber = sequenceNumberCount
                };
                var internationalProductHandlingSurcharge = new SapFiDelimited()
                {
                    DocumentDate = consigmentRequest.CreatedDate,
                    PostingDate = consigmentRequest.Payment.Date,
                    DocumentType = "XN",
                    Currency = "MYR",
                    ExchangeRate = string.Empty,
                    Reference = "OST",
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "620104",
                    Amount = internationalHandlingSurchargeTotal,
                    CostCenter = "11523003",
                    Quantity = internationalProductCount,
                    TaxCode = "ZR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "C002103",
                    Text = "1International Handling Surcharge - OD",
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
                    DocumentHeaderText = string.Empty,
                    PostingKey = "50",
                    AccountNumber = "620404",
                    Amount = internationalFuelSurchargeTotal,
                    CostCenter = "11523003",
                    Quantity = internationalProductCount,
                    TaxCode = "ZR",
                    Assignment = consigmentRequest.ReferenceNo,
                    ReferenceKey = "C002102",
                    Text = "1International Fuel Surcharge - OD",
                    SequenceNumber = sequenceNumberCount
                };

                if (domesticAndInternationalProductTotal.Amount > 0)
                {
                    sapFiFile.Add(domesticAndInternationalProductTotal);
                }
                if (domesticAndInternationalPickupTotal.Amount > 0)
                {
                    sapFiFile.Add(domesticAndInternationalPickupTotal);
                }
                if (domesticProductBaseRate.Amount > 0)
                {
                    sapFiFile.Add(domesticProductBaseRate);
                }
                if (domesticProductHandlingSurcharge.Amount > 0)
                {
                    sapFiFile.Add(domesticProductHandlingSurcharge);
                }
                if (domesticProductFuelSurcharge.Amount > 0)
                {
                    sapFiFile.Add(domesticProductFuelSurcharge);
                }
                if (internationalProductBaseRate.Amount > 0)
                {
                    sapFiFile.Add(internationalProductBaseRate);
                }
                if (internationalProductHandlingSurcharge.Amount > 0)
                {
                    sapFiFile.Add(internationalProductHandlingSurcharge);
                }
                if (internationalProductFuelSurcharge.Amount > 0)
                {
                    sapFiFile.Add(internationalProductFuelSurcharge);
                }
                if (domesticAndInternationalProductInsurance.Amount > 0)
                {
                    sapFiFile.Add(domesticAndInternationalProductInsurance);
                }
                if (domesticProductGst.Amount > 0)
                {
                    sapFiFile.Add(domesticProductGst);
                }

                sequenceNumberCount++;
            }

            var path = $@"{m_ostSapFolder}\OST_CACC_HQ_{DateTime.Now:yyyyMMdd-HHmmss}.txt";
            engine.WriteFile(path, sapFiFile);
            using (StreamWriter sw = File.AppendText(path))
            {
                sw.WriteLine("EOF");
            }
        }

        private static decimal GstCalculation(decimal value, int rounded = 2)
        {
            var gstValue = value * 0.06m;
            gstValue = decimal.Round(gstValue, rounded);
            return gstValue;
        }
    }
}
