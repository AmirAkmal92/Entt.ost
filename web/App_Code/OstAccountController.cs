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

using System.Net.Http;
using System.Collections.Generic;
using Bespoke.Sph.WebApi;

using System.IO;
using System.IO.Compression;
using System.Net;
using System.Text.RegularExpressions;
using static System.IO.File;

namespace web.sph.App_Code
{
    [RoutePrefix("ost-account")]
    public class OstAccountController : Controller
    {

        [Route("logout")]
        public async Task<ActionResult> Logoff()
        {
            HttpContext.GetOwinContext().Authentication.SignOut();
            try
            {
                var logger = ObjectBuilder.GetObject<ILogger>();
                await logger.LogAsync(new LogEntry { Log = EventLog.Security, Message = "Logoff" });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return Redirect("/");
        }

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
                    return RedirectToAction("Default", "OstHome");
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

        [AllowAnonymous]
        [HttpPost]
        [Route("register")]
        public async Task<ActionResult> AddUser(Profile profile)
        {
            var context = new SphDataContext();
            var userName = profile.UserName;
            if (string.IsNullOrWhiteSpace(profile.Designation)) throw new ArgumentNullException("Designation for  " + userName + " cannot be set to null or empty");
            var designation = await context.LoadOneAsync<Designation>(d => d.Name == profile.Designation);
            if (null == designation) throw new InvalidOperationException("Cannot find designation " + profile.Designation);
            var roles = designation.RoleCollection.ToArray();

            var em = Membership.GetUser(userName);

            if (null != em)
            {
                profile.Roles = roles;
                em.Email = profile.Email;

                var originalRoles = Roles.GetRolesForUser(userName);
                if (originalRoles.Length > 0)
                    Roles.RemoveUserFromRoles(userName, originalRoles);

                Roles.AddUserToRoles(userName, profile.Roles);
                Membership.UpdateUser(em);
                await CreateProfile(profile, designation);
                return Json(new { success = true, profile, status = "OK" });
            }

            try
            {
                Membership.CreateUser(userName, profile.Password, profile.Email);
            }
            catch (MembershipCreateUserException ex)
            {
                ObjectBuilder.GetObject<ILogger>().Log(new LogEntry(ex));
                return Json(new { message = ex.Message, success = false, status = "ERROR" });
            }

            Roles.AddUserToRoles(userName, roles);
            profile.Roles = roles;

            await CreateProfile(profile, designation);

            //Json(new { success = true, profile, status = "Created" });
            return RedirectToAction("register-success", "ost-account");
        }


        [AllowAnonymous]
        [Route("register")]
        public ActionResult RegisterNew()
        {
            //Todo: to be implemented
            return View();
        }

        /// <summary>
        /// Checks password complexity requirements for the actual membership provider
        /// </summary>
        /// <param name="password">password to check</param>
        /// <returns>true if the password meets the req. complexity</returns>
        public ActionResult CheckPasswordComplexity(string password)
        {
            var result = CheckPasswordComplexity(Membership.Provider, password);
            return Json(result, JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// Checks password complexity requirements for the given membership provider
        /// </summary>
        /// <param name="membershipProvider">membership provider</param>
        /// <param name="password">password to check</param>
        /// <returns>true if the password meets the req. complexity</returns>
        public static bool CheckPasswordComplexity(MembershipProvider membershipProvider, string password)
        {
            if (string.IsNullOrEmpty(password)) return false;
            if (password.Length < membershipProvider.MinRequiredPasswordLength) return false;
            int nonAlnumCount = password.Where((t, i) => !char.IsLetterOrDigit(password, i)).Count();
            if (nonAlnumCount < membershipProvider.MinRequiredNonAlphanumericCharacters) return false;
            if (!string.IsNullOrEmpty(membershipProvider.PasswordStrengthRegularExpression) &&
                !Regex.IsMatch(password, membershipProvider.PasswordStrengthRegularExpression))
            {
                return false;
            }
            return true;
        }


        private static async Task<UserProfile> CreateProfile(Profile profile, Designation designation)
        {
            if (null == profile) throw new ArgumentNullException(nameof(profile));
            if (null == designation) throw new ArgumentNullException(nameof(designation));
            if (string.IsNullOrWhiteSpace(designation.Name)) throw new ArgumentNullException(nameof(designation), "Designation Name cannot be null, empty or whitespace");
            if (string.IsNullOrWhiteSpace(profile.UserName)) throw new ArgumentNullException(nameof(profile), "Profile UserName cannot be null, empty or whitespace");

            var context = new SphDataContext();
            var usp = await context.LoadOneAsync<UserProfile>(p => p.UserName == profile.UserName) ?? new UserProfile();
            usp.UserName = profile.UserName;
            usp.FullName = profile.FullName;
            usp.Designation = profile.Designation;
            usp.Department = profile.Department;
            usp.Mobile = profile.Mobile;
            usp.Telephone = profile.Telephone;
            usp.Email = profile.Email;
            usp.RoleTypes = string.Join(",", profile.Roles);
            usp.StartModule = designation.StartModule;
            if (usp.IsNewItem) usp.Id = profile.UserName.ToIdFormat();

            using (var session = context.OpenSession())
            {
                session.Attach(usp);
                await session.SubmitChanges();
            }

            return usp;
        }
        public async Task<ActionResult> UpdateUser(UserProfile profile)
        {
            var context = new SphDataContext();
            var userprofile = await context.LoadOneAsync<UserProfile>(p => p.UserName == User.Identity.Name)
                ?? new UserProfile();
            userprofile.UserName = User.Identity.Name;
            userprofile.Email = profile.Email;
            userprofile.Telephone = profile.Telephone;
            userprofile.FullName = profile.FullName;
            userprofile.StartModule = profile.StartModule;
            userprofile.Language = profile.Language;

            if (userprofile.IsNewItem) userprofile.Id = userprofile.UserName.ToIdFormat();

            using (var session = context.OpenSession())
            {
                session.Attach(userprofile);
                await session.SubmitChanges();
            }
            this.Response.ContentType = "application/json; charset=utf-8";
            return Content(JsonConvert.SerializeObject(userprofile));


        }

        [AllowAnonymous]
        [Route("register-success")]
        public ActionResult RegisterSuccess()
        {
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


        public ActionResult ResetPassword(string userName, string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                return Json(new { OK = false, messages = "Please specify new Password" });

            var em = Membership.GetUser(userName);
            if (null == em) return Json(new { OK = false, messages = "User does not exist" });
            if (em.IsLockedOut)
            {
                em.UnlockUser();
            }

            var oldPassword = em.ResetPassword();
            var result = em.ChangePassword(oldPassword, password);
            Membership.UpdateUser(em);
            return Json(new { OK = result, messages = "Password for user has been reset." });
        }
    }
}