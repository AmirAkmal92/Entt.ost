using System.Collections.Generic;
using System.Threading.Tasks;

namespace Bespoke.PostEntt.Ost.Services
{
    public interface ISnbService
    {
        Task<IEnumerable<Product>> GetProductAsync();
        Task<IEnumerable<string>> GetItemCategoriesAsync();
        Task<decimal> CalculateRate(string code, decimal? weight, decimal? length, decimal? width, decimal? height);
        Task<decimal?> CalculateValueAddedServiceAsync(Product product, ValueAddedService surcharge);
    }
}