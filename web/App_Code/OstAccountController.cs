using System;
using System.Web.Mvc;
using Bespoke.Sph.Domain;
using System.Threading.Tasks;
using System.Linq;

namespace web.sph.App_Code
{
    [RoutePrefix("ost-account")]
    public class OstAccountController : Controller
    {
        [AllowAnonymous]
        [Route("login")]
        public ActionResult Login()
        {
            //Todo: to be implemented
            return View();
        }

        [Authorize]
        [Route("change-password")]
        public ActionResult ChangePassword()
        {
            //Todo: to be implemented
            return View();
        }

        [AllowAnonymous]
        [Route("forgot-password")]
        public ActionResult ForgotPassword()
        {
            //Todo: to be implemented
            return View();
        }

        [AllowAnonymous]
        [Route("reset-password/{id}")]
        public ActionResult ResetPassword(string id)
        {
            //Todo: to be implemented
            return View();
        }
    }
}