using System.Web.Mvc;

namespace web.sph.App_Code
{
    [RoutePrefix("shipment-volumetric")]
    public class ShipmentVolumetricController : Controller
    {
        [Route("")]
        [HttpGet]
        public ActionResult Volumetric()
        {
            return View();
        }
    }
}