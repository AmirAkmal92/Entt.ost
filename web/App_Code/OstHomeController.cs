using System.Web.Mvc;

namespace web.sph.App_Code
{
    [RoutePrefix("ost")]
    public class OstHomeController : Controller
    {
        [Route("")]
        public ActionResult Index()
        {
            if(!User.Identity.IsAuthenticated)
                return RedirectToAction("Login", "OstAccount");
            return View("Default");
        }

        [AllowAnonymous]
        [Route("contacts")]
        public ActionResult Contacts()
        {
            return View();
        }

        [AllowAnonymous]
        [Route("terms")]
        public ActionResult Terms()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("payment-gateway")]
        public ActionResult PaymentGateway()
        {
            ViewBag.Title = "Payment Gateway";
            var model = new PxRexModel();
            return View(model);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("payment-gateway")]
        public ActionResult PaymentGateway(PxRexModel model)
        {
            ViewBag.Title = "Payment Gateway";
            return View(model);
        }
    }
}