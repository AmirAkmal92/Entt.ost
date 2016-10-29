using System.Threading.Tasks;
using System.Web.Http;
using Bespoke.PostEntt.Ost.Services;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;


[RoutePrefix("snb-services")]
public class SnbServicesController : BaseApiController
{
    [HttpGet]
    [Route("products")]
    public async Task<IHttpActionResult> GetProductsAsync()
    {
        var snb = ObjectBuilder.GetObject<ISnbService>();
        var products = await snb.GetProductAsync();

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
    [HttpGet]
    [Route("{code}/price")]
    public async Task<IHttpActionResult> EstimatePrice(
        string code, 
        [FromUri(Name = "weight")]decimal? weight,
        [FromUri(Name = "length")]decimal? length = null,
        [FromUri(Name = "width")]decimal? width = null, 
        [FromUri(Name = "height")]decimal? height = null)
    {
        var snb = ObjectBuilder.GetObject<ISnbService>();
        var categories = await snb.CalculateRate(code, weight, length, width, height);

        return Ok(categories);
    }
}