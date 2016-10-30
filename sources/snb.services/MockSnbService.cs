using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bespoke.PostEntt.Ost.Services
{
    public class MockSnbService : ISnbService
    {
        public Task<IEnumerable<Product>> GetProductAsync()
        {
            var products = new[]
            {
                new Product {Code = "PLD100", Name = "Pos Laju Domestic", Parent="", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1001", Name = "Next Day Delivery", Parent="PLD100", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1002", Name = "Same Day Delivery", Parent="PLD100", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1004", Name = "Borneo Economy Express", Parent="", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1005", Name = "Putrajaya Express", Parent="PLD100", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1006", Name = "Parcel Domestic Surface", Parent="PLD100", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1007", Name = "Parcel Domestic Air", Parent="PLD100", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1008", Name = "Courier Charges - TNT", Parent="PLD100", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1009", Name = "PosLaju Economy Package", Parent="PLD100", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
                new Product {Code = "PLD1012", Name = "COURIER CHARGES - LPM SPM", Parent="PLD100", ValidFrom = DateTime.Today.AddYears(-1), ValidTo = DateTime.Today.AddYears(1)},
            };
            return Task.FromResult(products.AsEnumerable());
        }

        public Task<IEnumerable<string>> GetItemCategoriesAsync()
        {
            var categories = new[] {"Old Item",
                "Odd Item",
                "Merchandise",
                "Blood",
                "Extra Prepaid",
                "Parcel",
                "Motorbike",
                "Credit Card",
                "Document",
                "Prepaid"};
            return Task.FromResult(categories.AsEnumerable());
        }

        public Task<decimal> CalculateRate(string code, decimal? weight, decimal? length, decimal? width, decimal? height)
        {
            return Task.FromResult((weight ?? 1.0m) * (length ?? 1.01m) * (width ?? 1.03m));
        }

        public async Task<decimal?> CalculateValueAddedServiceAsync(Product product, ValueAddedService vas)
        {
            await Task.Delay(2000);
            if(string.IsNullOrWhiteSpace(vas.Formula))
                return new Random(DateTime.Now.Second).Next(DateTime.Now.Millisecond);
            return vas.Formula.Length;
        }
    }
}