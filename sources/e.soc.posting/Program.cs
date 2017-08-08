using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using FileHelpers;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace e.soc.posting
{
    class Program
    {
        private string m_ostBaseUrl;
        private string m_ostAdminToken;
        private string m_eSocFolder;

        public Program()
        {
            m_ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";
            m_eSocFolder = ConfigurationManager.GetEnvironmentVariable("ESocFolder") ?? @"C:\temp";
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
            var engine = new FileHelperEngine<ESocDelimited>();
            var eSocFiles = new List<ESocDelimited>();
            var consigmentRequests = new List<ConsigmentRequest>();

            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            bool requestPickup = true;
            int pickupCount = 0;
            int pickupPage = 1;
            int pickupSize = 20;

            while (requestPickup)
            {
                var requestUri = new Uri($"{m_ostBaseUrl}/api/consigment-requests/pickedup-all-within-range/{startDate}/{endDate}/?size={pickupSize}&page={pickupPage}");
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
                    Console.WriteLine($"Pickup Number: {consigmentRequest.Pickup.Number} .....");
                }
                Console.WriteLine($"Pickup count: {consigmentRequests.Count} .....");

                pickupCount = JObject.Parse(output).SelectToken("_count").Value<int>();
                pickupPage = JObject.Parse(output).SelectToken("_page").Value<int>();
                pickupSize = JObject.Parse(output).SelectToken("_size").Value<int>();
                if ((pickupPage * pickupSize) >= pickupCount)
                {
                    requestPickup = false;
                }
                pickupPage++;
            }

            int sequenceNumberCount = 1;
            foreach (var consigmentRequest in consigmentRequests)
            {
                var eSocFileHeader = new ESocDelimited
                {
                    Indicator = "9",
                    OrderType = "01",
                    SalesOrg = "1000",
                    DistributionChannel = "60",
                    Division = "10",
                    SoldToPartyAccountNumber = consigmentRequest.UserId,
                    CourierIdHeader = "00392557", //TODO
                    CourierId = "YUSRI", //TODO
                    ConsignmentAcceptanceTimeStamp = consigmentRequest.CreatedDate,
                    BranchCodeHeader = "5312", //TODO
                    CourierIdItem = "-",
                    ShipToPartyPostcode = "-",
                    ProductCodeMaterial = "-",
                    OrderQuantity = "-",
                    BranchCodeItem = "-",
                    Agent = "-",
                    ConNoteNumberParent = "-",
                    ConNoteNumberChild = "-",
                    Weight = "-",
                    CustomerDeclaredWeight = "-",
                    VolumetricDimension = "-",
                    VolumetricWeight = "-",
                    ValueAdded = "-",
                    SurchargeCode = "-",
                    SumInsured = "-",
                    SubAccountRef = "-",
                    RecipientRefNumber = "-",
                    Zone = "-",
                    CountryCode = "-",
                    ItemCategoryType = "-",
                    MpsIndicator = "-",
                    OddItemAmount = "-",
                    OddItemDescription = "-",
                    PickupNumber = consigmentRequest.Pickup.Number,
                    Mhl = "-",
                    Batch = string.Format("{0:00000}", sequenceNumberCount)
                };
                eSocFiles.Add(eSocFileHeader);

                foreach (var consigment in consigmentRequest.Consignments)
                {
                    var eSocFileItem = new ESocDelimited
                    {
                        Indicator = "1",
                        OrderType = "-",
                        SalesOrg = "-",
                        DistributionChannel = "-",
                        Division = "-",
                        SoldToPartyAccountNumber = consigmentRequest.UserId,
                        CourierIdHeader = "-",
                        CourierId = "-",
                        ConsignmentAcceptanceTimeStamp = consigmentRequest.CreatedDate,
                        BranchCodeHeader = "-",
                        CourierIdItem = "00392557", //TODO
                        ShipToPartyPostcode = consigment.Penerima.Address.Postcode,
                        ProductCodeMaterial = "80000000",
                        OrderQuantity = "1",
                        BranchCodeItem = "5312", //TODO
                        Agent = "-",
                        ConNoteNumberParent = consigment.ConNote,
                        ConNoteNumberChild = "-", //TODO
                        Weight = "-",
                        CustomerDeclaredWeight = consigment.Produk.Weight.ToString("0.000"),
                        VolumetricDimension = $"{consigment.Produk.Length.ToString("0.00")}x{consigment.Produk.Width.ToString("0.00")}x{consigment.Produk.Height.ToString("0.00")}",
                        VolumetricWeight = GetVolumetricWeight(consigment).ToString("0.000"),
                        ValueAdded = "1101",
                        SurchargeCode = "0101",
                        SumInsured = "-", //TODO
                        SubAccountRef = "-",
                        RecipientRefNumber = "-",
                        Zone = "01",
                        CountryCode = consigment.Penerima.Address.Country,
                        ItemCategoryType = consigment.Produk.ItemCategory,
                        MpsIndicator = (consigment.IsMps) ? "02" : "01",
                        OddItemAmount = "-",
                        OddItemDescription = "-",
                        PickupNumber = "-",
                        Mhl = "-",
                        Batch = string.Format("{0:00000}", sequenceNumberCount)
                    };
                    eSocFiles.Add(eSocFileItem);
                }
                sequenceNumberCount++;
            }

            var path = $@"{m_eSocFolder}\est_esoc_hq_{DateTime.Now:yyyyMMdd-HHmmss}_{eSocFiles.Count}_{string.Format("{0:00000}", sequenceNumberCount - 1)}.txt";
            engine.WriteFile(path, eSocFiles);

            await Task.Delay(100);
        }

        private static decimal GetVolumetricWeight(Consignment consigment)
        {
            if (consigment.Produk.Length > 0 && consigment.Produk.Width > 0 && consigment.Produk.Height > 0)
            {
                return (consigment.Produk.Length * consigment.Produk.Width * consigment.Produk.Height) / 6000;
            }
            return 0.00m;
        }
    }
}
