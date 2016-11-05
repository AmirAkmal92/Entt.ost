using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using Bespoke.PostEntt.Ost.Services;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using Product = Bespoke.PostEntt.Ost.Services.Product;

public class CalculateValueAddedServiceViewModel
{
    public Product Product { get; set; }
    public ValueAddedService ValueAddedService { get; set; }
    public Bespoke.Ost.ConsigmentRequests.Domain.ConsigmentRequest Request { get; set; }
}
[RoutePrefix("snb-services")]
public class SnbServicesController : BaseApiController
{
    
    [HttpPost]
    [Route("calculate-value-added-service")]
    public async Task<IHttpActionResult> CalculateSurchargeAsync([FromBody]CalculateValueAddedServiceViewModel vm)
    {
        var snb = ObjectBuilder.GetObject<ISnbService>();
        var request = new QuotationRequest
        {
            ItemCategory = vm.Request.Product.ItemCategory,
            Weight = vm.Request.Product.Weight,
            Height = vm.Request.Product.Volume.Height,
            Length = vm.Request.Product.Volume.Length,
            Width = vm.Request.Product.Volume.Width,
            SenderCountry = vm.Request.Sender.Address.Country,
            SenderPostcode = vm.Request.Sender.Address.Postcode,
            ReceiverCountry = vm.Request.Receivers[0].Address.Country,
            ReceiverPostcode = vm.Request.Receivers[0].Address.Postcode
        };
        var value = await snb.CalculateValueAddedServiceAsync(request, vm.Product, vm.ValueAddedService);

        return Ok(value);
    }


    [HttpGet]
    [Route("products/")]
    public async Task<IHttpActionResult> GetProductsAsync( [FromUri(Name = "from")]string originPostcode,
        [FromUri(Name = "to")]string destinationPostcode,
        [FromUri(Name = "weight")]decimal? weight,
        [FromUri(Name = "country")]string destinationCountry = "MY",
        [FromUri(Name = "length")]decimal? length = null,
        [FromUri(Name = "width")]decimal? width = null,
        [FromUri(Name = "height")]decimal? height = null)
    {
        var model = new SuggestProductModel
        {
            OriginPostcode = originPostcode,
            Country = destinationCountry,
            DestinationPostcode = destinationPostcode,
            Height = height,
            Length = length,
            Weight = weight,
            Width = width
        };
        var snb = ObjectBuilder.GetObject<ISnbService>();
        var products = await snb.GetProductAsync(model, new CodedValueAddedServicesRule.CodedValuedAddedServicesRule());

        return Ok(products);
    }


    [HttpGet]
    [Route("item-categories")]
    public async Task<IHttpActionResult> GetItemCategoriesAsync()
    {
        var snb = ObjectBuilder.GetObject<ISnbService>();
        var categories = await snb.GetItemCategoriesAsync();

        return Ok(categories);
    }

    [HttpPost]
    [Route("calculate-published-rate")]
    public async Task<IHttpActionResult> EstimatePrice(CalculatePublishedRateViewModel model)
    {
        var snb = ObjectBuilder.GetObject<ISnbService>();        
        var rate = await snb.CalculatePublishedRateAsync(model.Request, model.Product, model.ValueAddedServices);
        return Ok(rate);
    }
}

public class CalculatePublishedRateViewModel
{
    public QuotationRequest Request { get; set; }
    public Product Product { get; set; }
    public IEnumerable<ValueAddedService> ValueAddedServices { get; set; }
}