using System.Collections.Generic;
using System.Threading.Tasks;

namespace Bespoke.PostEntt.Ost.Services
{
    public interface ISnbService
    {
        Task<IEnumerable<Product>> GetProductAsync(SuggestProductModel model);
        Task<IEnumerable<string>> GetItemCategoriesAsync();
        Task<decimal> CalculateRate(string code, decimal? weight, decimal? length, decimal? width, decimal? height);
        Task<decimal?> CalculateValueAddedServiceAsync(QuotationRequest request, Product product, ValueAddedService surcharge);
    }

    public class SuggestProductModel
    {
        public string Category { get; set; }
        public string OriginPostcode { get; set; }
        public string DestinationPostcode { get; set; }
        public string Country { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Width { get; set; }
        public decimal? Length { get; set; }
        public decimal? Height { get; set; }
    }
}