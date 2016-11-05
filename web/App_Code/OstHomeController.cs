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
    }
}