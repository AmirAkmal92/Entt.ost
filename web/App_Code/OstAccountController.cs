using System;
using System.Linq;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Bespoke.Sph.Domain;
using Newtonsoft.Json;

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

        [AllowAnonymous]
        [HttpPost]
        [Route("login")]
        public async Task<ActionResult> Login(OstLoginModel model, string returnUrl = "/")
        {
            var logger = ObjectBuilder.GetObject<ILogger>();
            if (ModelState.IsValid)
            {
                var directory = ObjectBuilder.GetObject<IDirectoryService>();
                if (await directory.AuthenticateAsync(model.UserName, model.Password))
                {
                    var identity = new ClaimsIdentity(ConfigurationManager.ApplicationName + "Cookie");
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, model.UserName));
                    identity.AddClaim(new Claim(ClaimTypes.Name, model.UserName));
                    var roles = Roles.GetRolesForUser(model.UserName).Select(x => new Claim(ClaimTypes.Role, x));
                    identity.AddClaims(roles);


                    var context = new SphDataContext();
                    var profile = await context.LoadOneAsync<UserProfile>(u => u.UserName == model.UserName);
                    await logger.LogAsync(new LogEntry { Log = EventLog.Security });
                    if (null != profile)
                    {
                        var claims = profile.GetClaims();
                        identity.AddClaims(claims);

                        var designation = context.LoadOneFromSources<Designation>(x => x.Name == profile.Designation);
                        if (null != designation && designation.EnforceStartModule)
                            profile.StartModule = designation.StartModule;

                        HttpContext.GetOwinContext().Authentication.SignIn(identity);

                        if (returnUrl == "/" ||
                            returnUrl.Equals("/ost", StringComparison.InvariantCultureIgnoreCase) ||
                            returnUrl.Equals("/ost#", StringComparison.InvariantCultureIgnoreCase) ||
                            returnUrl.Equals("/ost/", StringComparison.InvariantCultureIgnoreCase) ||
                            returnUrl.Equals("/ost/#", StringComparison.InvariantCultureIgnoreCase) ||
                            string.IsNullOrWhiteSpace(returnUrl))
                            return Redirect("/ost#" + profile.StartModule);
                    }
                    HttpContext.GetOwinContext().Authentication.SignIn(identity);
                    if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
                        return Redirect(returnUrl);
                    return RedirectToAction("Index", "OstHome");
                }
                var user = await directory.GetUserAsync(model.UserName);
                await logger.LogAsync(new LogEntry { Log = EventLog.Security, Message = "Login Failed" });
                if (null != user && user.IsLockedOut)
                    ModelState.AddModelError("", "Your acount has beeen locked, Please contact your administrator.");
                else
                    ModelState.AddModelError("", "The user name or password provided is incorrect.");
            }



            return View(model);
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