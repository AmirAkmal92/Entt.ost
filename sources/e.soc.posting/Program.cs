using FileHelpers;
using System;
using System.Collections.Generic;
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
            var eSocBatch = "00001";

            var eSocFile1 = new ESocDelimited
            {
                Indicator = "9",
                OrderType = "01",
                SalesOrg = "1000",
                DistributionChannel = "60",
                Division = "10",
                SoldToPartyAccountNumber = "8800479097",
                CourierIdHeader = "00392557",
                CourierId = "YUSRI",
                ConsignmentAcceptanceTimeStamp = DateTime.Now,
                BranchCodeHeader = "5312",
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
                PickupNumber = "V952061",
                Mhl = "-",
                Batch = eSocBatch
            };

            var eSocFile2 = new ESocDelimited
            {
                Indicator = "1",
                OrderType = "-",
                SalesOrg = "-",
                DistributionChannel = "-",
                Division = "-",
                SoldToPartyAccountNumber = "8800479097",
                CourierIdHeader = "-",
                CourierId = "-",
                ConsignmentAcceptanceTimeStamp = DateTime.Now,
                BranchCodeHeader = "-",
                CourierIdItem = "00392557",
                ShipToPartyPostcode = "81100",
                ProductCodeMaterial = "80000000",
                OrderQuantity = "1",
                BranchCodeItem = "5312",
                Agent = "-",
                ConNoteNumberParent = "EG629219139MY",
                ConNoteNumberChild = "-",
                Weight = "0.200",
                CustomerDeclaredWeight = "-",
                VolumetricDimension = "0x0x0",
                VolumetricWeight = "0.000",
                ValueAdded = "1101",
                SurchargeCode = "0101",
                SumInsured = "-",
                SubAccountRef = "-",
                RecipientRefNumber = "-",
                Zone = "02",
                CountryCode = "MY",
                ItemCategoryType = "01",
                MpsIndicator = "01",
                OddItemAmount = "-",
                OddItemDescription = "-",
                PickupNumber = "-",
                Mhl = "-",
                Batch = eSocBatch
            };

            var eSocFile3 = new ESocDelimited
            {
                Indicator = "1",
                OrderType = "-",
                SalesOrg = "-",
                DistributionChannel = "-",
                Division = "-",
                SoldToPartyAccountNumber = "8800479097",
                CourierIdHeader = "-",
                CourierId = "-",
                ConsignmentAcceptanceTimeStamp = DateTime.Now,
                BranchCodeHeader = "-",
                CourierIdItem = "00392557",
                ShipToPartyPostcode = "40100",
                ProductCodeMaterial = "80000000",
                OrderQuantity = "1",
                BranchCodeItem = "5312",
                Agent = "-",
                ConNoteNumberParent = "EG629219140MY",
                ConNoteNumberChild = "-",
                Weight = "0.500",
                CustomerDeclaredWeight = "-",
                VolumetricDimension = "0x0x0",
                VolumetricWeight = "0.000",
                ValueAdded = "1101",
                SurchargeCode = "0101",
                SumInsured = "-",
                SubAccountRef = "-",
                RecipientRefNumber = "-",
                Zone = "02",
                CountryCode = "MY",
                ItemCategoryType = "01",
                MpsIndicator = "01",
                OddItemAmount = "-",
                OddItemDescription = "-",
                PickupNumber = "-",
                Mhl = "-",
                Batch = eSocBatch
            };

            eSocFiles.Add(eSocFile1);
            eSocFiles.Add(eSocFile2);
            eSocFiles.Add(eSocFile3);

            var path = $@"{m_eSocFolder}\est_esoc_hq_{DateTime.Now:yyyyMMdd-HHmmss}_{eSocFiles.Count}_{eSocBatch}.txt";
            engine.WriteFile(path, eSocFiles);

            await Task.Delay(100);
        }
    }
}
