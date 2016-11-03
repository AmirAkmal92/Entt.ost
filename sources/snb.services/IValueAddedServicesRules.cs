using System.Threading.Tasks;

namespace Bespoke.PostEntt.Ost.Services
{
    public interface IValueAddedServicesRules
    {
        Task<bool> Validate(SuggestProductModel model, Product product, ValueAddedService vas);
    }
}
