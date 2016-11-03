using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Bespoke.PostEntt.Ost.Services
{
    public interface ISnbService
    {
        Task<IEnumerable<Product>> GetProductAsync(SuggestProductModel model, IValueAddedServicesRules rules);
        Task<IEnumerable<string>> GetItemCategoriesAsync();
        Task<decimal> CalculateRate(string code, decimal? weight, decimal? length, decimal? width, decimal? height);
        Task<decimal?> CalculateValueAddedServiceAsync(QuotationRequest request, Product product, ValueAddedService surcharge);
    }

    public class SuggestProductModel
    {
        private decimal? _weight;
        public string OriginPostcode { get; set; }
        public string DestinationPostcode { get; set; }
        public string Country { get; set; }

        public decimal? Weight
        {
            get
            {
                var volumetric = (Width ?? 0)*(Length ?? 0)*(Height ?? 0)/5000;
                return Math.Max(_weight ?? 0, volumetric);
            }
            set { _weight = value; }
        }

        public decimal? Width { get; set; }
        public decimal? Length { get; set; }
        public decimal? Height { get; set; }
    }
}