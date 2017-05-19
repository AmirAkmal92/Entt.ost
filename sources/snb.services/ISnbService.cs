using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Bespoke.PostEntt.Ost.Services
{
    public interface ISnbService
    {
        Task<IEnumerable<Product>> GetProductAsync(SuggestProductModel model, IValueAddedServicesRules rules);
        Task<IEnumerable<string>> GetItemCategoriesAsync();
        Task<decimal?> CalculateValueAddedServiceAsync(QuotationRequest request, Product product, ValueAddedService valueAddedService);
        Task<PublishedRate> CalculatePublishedRateAsync(QuotationRequest request, Product product, IEnumerable<ValueAddedService> valueAddedServices);
    }

    public class SuggestProductModel
    {
        private decimal? m_weight;
        public string OriginPostcode { get; set; }
        public string DestinationPostcode { get; set; }
        public string Country { get; set; }

        public decimal? Weight
        {
            get
            {
                if ((Width ?? 0) >= 30 || (Length ?? 0) >= 30 || (Height ?? 0) >= 30)
                {
                    var volumetric = (Width ?? 0) * (Length ?? 0) * (Height ?? 0) / 6000;
                    return System.Math.Max(m_weight ?? 0, volumetric);
                }

                return (m_weight ?? 0);
            }
            set { m_weight = value; }
        }

        public decimal? Width { get; set; }
        public decimal? Length { get; set; }
        public decimal? Height { get; set; }
    }
}