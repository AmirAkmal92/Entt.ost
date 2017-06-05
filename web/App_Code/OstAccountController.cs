using Bespoke.Sph.Domain;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace web.sph.App_Code
{
    [RoutePrefix("ost-account")]
    public class OstAccountController : Controller
    {
        [AllowAnonymous]
        [Route("first-time-login/step/{step}")]
        public ActionResult FirstTimeLogin(int step, bool success = true, string status = "OK")
        {
            ViewBag.step = step;
            ViewBag.success = success;
            ViewBag.status = status;
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("first-time-login/step/{step}")]
        public ActionResult FirstTimeLogin(int step, EstLoginModel model)
        {
            if (step == 1)
            {
                if (model.AccountNo != "1234567890")
                {
                    return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = "Your account do not have email for verification. Please contact administrator." });
                }
                return RedirectToAction("first-time-login/step/2", "ost-account");
            }
            else if (step == 2)
            {
                if (model.Email != "zakirin@yahoo.com")
                {
                    return RedirectToAction("first-time-login/step/2", "ost-account", new { success = false, status = "You have entered invalid email. Please contact administrator." });
                }
                return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "verify-email" });
            }
            else
            {
                //todo
                return RedirectToAction("first-time-login/step/3", "ost-account");
            }
        }

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
        [Route("success")]
        public ActionResult Success(bool success = false, string status = "ERROR", string operation = "default")
        {
            ViewBag.success = success;
            ViewBag.status = status;
            ViewBag.operation = operation;

            return View();
        }

        [AllowAnonymous]
        [Route("login")]
        public ActionResult Login(bool success = true, string status = "OK")
        {
            ViewBag.success = success;
            ViewBag.status = status;

            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("login")]
        public async Task<ActionResult> Login(OstLoginModel model, string returnUrl = "/")
        {
            if (string.IsNullOrEmpty(model.UserName))
                return RedirectToAction("login", "ost-account", new { success = false, status = "Username cannot be set to null or empty." });
            if (string.IsNullOrEmpty(model.Password))
                return RedirectToAction("login", "ost-account", new { success = false, status = "Password cannot be set to null or empty." });

            var logger = ObjectBuilder.GetObject<ILogger>();

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
                    // user email address verification pending
                    if (!profile.HasChangedDefaultPassword)
                        return RedirectToAction("login", "ost-account", new { success = false, status = "Email verification pending. Please check your inbox for a verification email. You will be allowed to sign in after verification is complete." });

                    var claims = profile.GetClaims();
                    identity.AddClaims(claims);

                    var designation = context.LoadOneFromSources<Designation>(x => x.Name == profile.Designation);
                    if (null != designation && designation.EnforceStartModule)
                        profile.StartModule = designation.StartModule;

                    HttpContext.GetOwinContext().Authentication.SignIn(identity);

                    if (string.IsNullOrEmpty(profile.Designation) 
                        || !profile.Designation.Equals("No contract customer")
                        || !profile.Designation.Equals("Contract customer"))
                        return Redirect("/sph");

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
                return RedirectToAction("login", "ost-account", new { success = false, status = "Your acount has beeen locked, Please contact your administrator." });
            else
                return RedirectToAction("login", "ost-account", new { success = false, status = "The user name or password provided is incorrect." });
        }

        [AllowAnonymous]
        [Route("register")]
        public ActionResult Register(bool success = true, string status = "OK")
        {
            ViewBag.success = success;
            ViewBag.status = status;

            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("register")]
        public async Task<ActionResult> Register(OstRegisterModel model)
        {
            if (string.IsNullOrEmpty(model.UserName))
                return RedirectToAction("register", "ost-account", new { success = false, status = "Username cannot be set to null or empty." });
            if (string.IsNullOrEmpty(model.Designation))
                return RedirectToAction("register", "ost-account", new { success = false, status = "Designation cannot be set to null or empty." });
            if (string.IsNullOrEmpty(model.Password))
                return RedirectToAction("register", "ost-account", new { success = false, status = "Password cannot be set to null or empty." });
            if (!model.Password.Equals(model.ConfirmPassword))
                return RedirectToAction("register", "ost-account", new { success = false, status = "Password and ConfirmPassword cannot be different." });
            if (string.IsNullOrEmpty(model.Email))
                return RedirectToAction("register", "ost-account", new { success = false, status = "Email cannot be set to null or empty." });

            Profile profile = new Profile();
            profile.UserName = model.UserName;
            profile.Email = model.Email;
            profile.Password = model.Password;

            var context = new SphDataContext();
            var designation = await context.LoadOneAsync<Designation>(d => d.Name == model.Designation);
            if (null == designation) throw new InvalidOperationException("Cannot find designation " + model.Designation);

            profile.Designation = model.Designation;
            profile.Roles = designation.RoleCollection.ToArray();

            var em = Membership.GetUser(profile.UserName);
            if (null != em) return RedirectToAction("register", "ost-account", new { success = false, status = $"User {profile.UserName} already exist." });

            try
            {
                Membership.CreateUser(profile.UserName, profile.Password, profile.Email);
            }
            catch (MembershipCreateUserException ex)
            {
                ObjectBuilder.GetObject<ILogger>().Log(new LogEntry(ex));
                return RedirectToAction("register", "ost-account", new { success = false, status = ex.Message });
            }

            Roles.AddUserToRoles(profile.UserName, profile.Roles);
            await CreateProfile(profile, designation);
            await SendVerificationEmail(profile.Email, profile.UserName);

            return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "register" });
        }

        [AllowAnonymous]
        [Route("register-est")]
        public ActionResult RegisterEst(bool success = true, string status = "OK")
        {
            ViewBag.success = success;
            ViewBag.status = status;

            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("register-est")]
        public async Task<ActionResult> RegisterEst()
        {
            //TODO
            return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "register" });
        }

        [AllowAnonymous]
        [Route("verify-email/{id}")]
        public async Task<ActionResult> VerifyEmail(string id)
        {
            ViewBag.success = true;
            ViewBag.status = "OK";
            var context = new SphDataContext();

            var setting = await context.LoadOneAsync<Setting>(x => x.Id == id);
            if (null == setting)
            {
                ViewBag.success = false;
                ViewBag.status = "The link is invalid.";
                return View();
            }

            if ((DateTime.Now - setting.CreatedDate).TotalHours > 3)
            {
                ViewBag.success = false;
                ViewBag.status = "The link has expired.";
                return View();
            }

            if (!setting.Key.Equals("VerifyEmail"))
            {
                ViewBag.success = false;
                ViewBag.status = "The link is not associated with verify email.";
                return View();
            }

            var username = Membership.GetUserNameByEmail(setting.UserName);
            if (null == username)
            {
                ViewBag.success = false;
                ViewBag.status = $"Cannot find any user with email {setting.UserName}.";
                return View();
            }

            // email address verification complete
            var userProfile = await context.LoadOneAsync<UserProfile>(p => p.UserName == username);
            userProfile.HasChangedDefaultPassword = true;
            using (var session = context.OpenSession())
            {
                session.Attach(userProfile);
                await session.SubmitChanges();
            }

            return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "verify-email" });
        }

        [AllowAnonymous]
        [Route("forgot-password")]
        public ActionResult ForgotPassword(bool success = true, string status = "OK")
        {
            ViewBag.success = success;
            ViewBag.status = status;

            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("forgot-password")]
        public async Task<ActionResult> ForgotPassword(string email)
        {
            if (string.IsNullOrEmpty(email))
                return RedirectToAction("forgot-password", "ost-account", new { success = false, status = "Email cannot be set to null or empty." });

            var username = Membership.GetUserNameByEmail(email);
            if (string.IsNullOrWhiteSpace(username))
            {
                return RedirectToAction("forgot-password", "ost-account", new { success = false, status = $"Cannot find any user with email {email}" });
            }

            await SendForgotPasswordEmail(email, username);

            return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "forgot-password" });
        }

        [AllowAnonymous]
        [Route("reset-password/{id}")]
        public async Task<ActionResult> ResetPassword(string id, bool success = true, string status = "OK")
        {
            ViewBag.success = success;
            ViewBag.status = status;

            var context = new SphDataContext();
            var setting = await context.LoadOneAsync<Setting>(x => x.Id == id);
            if (null == setting)
            {
                ViewBag.success = false;
                ViewBag.status = "The link is invalid.";
                return View();
            }

            if ((DateTime.Now - setting.CreatedDate).TotalHours > 3)
            {
                ViewBag.success = false;
                ViewBag.status = "The link has expired.";
                return View();
            }

            if (!setting.Key.Equals("ForgotPassword"))
            {
                ViewBag.success = false;
                ViewBag.status = "The link is not associated with forgot password.";
                return View();
            }

            var username = Membership.GetUserNameByEmail(setting.UserName);
            if (null == username)
            {
                ViewBag.success = false;
                ViewBag.status = $"Cannot find any user with email {setting.UserName}.";
                return View();
            }

            ViewBag.id = id;
            ViewBag.email = setting.UserName;
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("reset-password")]
        public ActionResult ResetPassword(OstResetPasswordModel model)
        {
            if (string.IsNullOrEmpty(model.Password))
                return RedirectToAction($"reset-password/{model.Id}", "ost-account", new { success = false, status = "Email cannot be set to null or empty." });
            if (string.IsNullOrEmpty(model.Password))
                return RedirectToAction($"reset-password/{model.Id}", "ost-account", new { success = false, status = "Password cannot be set to null or empty." });
            if (!model.Password.Equals(model.ConfirmPassword))
                return RedirectToAction($"reset-password/{model.Id}", "ost-account", new { success = false, status = "Password and ConfirmPassword cannot be different." });

            var username = Membership.GetUserNameByEmail(model.Email);
            var user = Membership.GetUser(username);
            if (null == user) return RedirectToAction($"reset-password/{model.Id}", "ost-account", new { success = false, status = $"Cannot find user {user}." });
            var temp = user.ResetPassword();
            user.ChangePassword(temp, model.Password);
            Membership.UpdateUser(user);

            return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "reset-password" });
        }

        [AllowAnonymous]
        [Route("send-verify-email")]
        public ActionResult SendVerifyEmail(bool success = true, string status = "OK")
        {
            ViewBag.success = success;
            ViewBag.status = status;

            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("send-verify-email")]
        public async Task<ActionResult> SendVerifyEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return RedirectToAction("send-verify-email", "ost-account", new { success = false, status = "Email cannot be set to null or empty." });

            var username = Membership.GetUserNameByEmail(email);
            if (string.IsNullOrWhiteSpace(username))
            {
                return RedirectToAction("send-verify-email", "ost-account", new { success = false, status = $"Cannot find any user with email {email}" });
            }

            await SendVerificationEmail(email, username);

            return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "send-verify-email" });
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("social-media-handle")]
        public async Task<ActionResult> SocialMediaHandle(OstSocialModel model)
        {
            if (string.IsNullOrEmpty(model.Email))
            {
                Response.StatusCode = (int)HttpStatusCode.Accepted;
                return Json(new { success = false, status = "ERROR", message = "Email cannot be set to null or empty." });
            }
            if (string.IsNullOrEmpty(model.Name))
            {
                Response.StatusCode = (int)HttpStatusCode.Accepted;
                return Json(new { success = false, status = "ERROR", message = "Name cannot be set to null or empty." });
            }
            if (string.IsNullOrEmpty(model.Id))
            {
                Response.StatusCode = (int)HttpStatusCode.Accepted;
                return Json(new { success = false, status = "ERROR", message = "Id cannot be set to null or empty." });
            }

            if (!string.IsNullOrEmpty(model.IdToken))
            {
                // TODO: Verify the integrity of the ID token
                // Phase 2
                if (model.Brand.Equals("facebook"))
                {

                }
                if (model.Brand.Equals("google"))
                {

                }
            }

            var username = Membership.GetUserNameByEmail(model.Email);
            if (null == username)
            {
                //register
                Profile profile = new Profile();
                string strippedName = new string(model.Name.ToCharArray()
                    .Where(c => !char.IsWhiteSpace(c))
                    .ToArray()).ToLower();
                Random rnd = new Random();
                int rndTail = rnd.Next(1000, 10000);
                var newUserName = strippedName + rndTail.ToString();
                profile.UserName = newUserName;

                string password = Membership.GeneratePassword(8, 1);
                profile.Password = password;

                profile.Email = model.Email;
                profile.FullName = model.Name;
                profile.Designation = "No contract customer";

                var context = new SphDataContext();
                var designation = await context.LoadOneAsync<Designation>(d => d.Name == profile.Designation);
                if (null == designation)
                {
                    Response.StatusCode = (int)HttpStatusCode.Accepted;
                    return Json(new { success = false, status = "ERROR", message = $"Cannot find designation {profile.Designation}." });
                }

                profile.Roles = designation.RoleCollection.ToArray();

                var em = Membership.GetUser(profile.UserName);
                if (null != em)
                {
                    Response.StatusCode = (int)HttpStatusCode.Accepted;
                    return Json(new { success = false, status = "ERROR", message = $"User {profile.UserName} already exist." });
                }

                try
                {
                    Membership.CreateUser(profile.UserName, profile.Password, profile.Email);
                }
                catch (MembershipCreateUserException ex)
                {
                    ObjectBuilder.GetObject<ILogger>().Log(new LogEntry(ex));
                    Response.StatusCode = (int)HttpStatusCode.Accepted;
                    return Json(new { success = false, status = "ERROR", message = ex.Message });
                }

                Roles.AddUserToRoles(profile.UserName, profile.Roles);
                await CreateProfile(profile, designation);
                await SendVerificationEmail(profile.Email, profile.UserName);

                //create user details
                var userDetail = new Bespoke.Ost.UserDetails.Domain.UserDetail();
                var guid = Guid.NewGuid().ToString();
                userDetail.Id = guid;
                userDetail.UserId = profile.UserName;
                userDetail.Profile.ContactPerson = profile.FullName;
                userDetail.ProfilePictureUrl = model.PictureUrl;
                userDetail.Profile.ContactInformation.Email = profile.Email;
                userDetail.Profile.Address.Country = "MY";
                using (var session = context.OpenSession())
                {
                    session.Attach(userDetail);
                    await session.SubmitChanges("Default");
                }

                Response.StatusCode = (int)HttpStatusCode.OK;
                return Json(new { success = true, status = "OK", message = $"User {profile.UserName} with email {profile.Email} has been registered." });
            }
            else
            {
                //login
                var logger = ObjectBuilder.GetObject<ILogger>();
                var identity = new ClaimsIdentity(ConfigurationManager.ApplicationName + "Cookie");
                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, username));
                identity.AddClaim(new Claim(ClaimTypes.Name, username));
                var roles = Roles.GetRolesForUser(username).Select(x => new Claim(ClaimTypes.Role, x));
                identity.AddClaims(roles);


                var context = new SphDataContext();
                var profile = await context.LoadOneAsync<UserProfile>(u => u.UserName == username);
                await logger.LogAsync(new LogEntry { Log = EventLog.Security });
                if (null != profile)
                {
                    // user email address verification pending
                    if (!profile.HasChangedDefaultPassword)
                    {
                        Response.StatusCode = (int)HttpStatusCode.Accepted;
                        return Json(new { success = false, status = "ERROR", message = "Email verification pending. Please check your inbox for a verification email. You will be allowed to sign in after verification is complete." });
                    }

                    var claims = profile.GetClaims();
                    identity.AddClaims(claims);

                    var designation = context.LoadOneFromSources<Designation>(x => x.Name == profile.Designation);
                    if (null != designation && designation.EnforceStartModule)
                        profile.StartModule = designation.StartModule;

                    HttpContext.GetOwinContext().Authentication.SignIn(identity);

                    Response.StatusCode = (int)HttpStatusCode.OK;
                    return Json(new { success = true, status = "OK", message = $"User {profile.UserName} with email {profile.Email} has been authenticated." });
                }
                HttpContext.GetOwinContext().Authentication.SignIn(identity);

                Response.StatusCode = (int)HttpStatusCode.OK;
                return Json(new { success = true, status = "OK", message = $"User {profile.UserName} with email {profile.Email} has been authenticated." });
            }
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

        private static async Task SendVerificationEmail(string userEmail, string userName)
        {
            var setting = new Setting
            {
                UserName = userEmail,
                Key = "VerifyEmail",
                Value = DateTime.Now.ToString("s"),
                Id = Strings.GenerateId()
            };
            await SaveSetting(setting, "VerifyEmail");

            var emailSubject = ConfigurationManager.ApplicationFullName + " - Verify your email address";
            var emailBody = $@"Hello {userName},

Please click the link below to verify your email address.
    {ConfigurationManager.BaseUrl}/ost-account/verify-email/{setting.Id}";

            await SendEmail(userEmail, emailSubject, emailBody);
        }

        private static async Task SendForgotPasswordEmail(string userEmail, string userName)
        {
            var setting = new Setting
            {
                UserName = userEmail,
                Key = "ForgotPassword",
                Value = DateTime.Now.ToString("s"),
                Id = Strings.GenerateId()
            };
            await SaveSetting(setting, "ForgotPassword");

            var emailSubject = ConfigurationManager.ApplicationFullName + " - Forgot your password";
            var emailBody = $@"Hello {userName},

Please click the link below to change your password.
    {ConfigurationManager.BaseUrl}/ost-account/reset-password/{setting.Id}";

            await SendEmail(userEmail, emailSubject, emailBody);
        }

        private static async Task SendEmail(string emailTo, string emailSubject, string emailBody)
        {
            using (var smtp = new SmtpClient())
            {
                var mail = new MailMessage("entt.admin@pos.com.my", emailTo)
                {
                    Subject = emailSubject,
                    Body = emailBody,
                    IsBodyHtml = false
                };
                await smtp.SendMailAsync(mail);
            }
        }

        private static async Task SaveSetting(Setting setting, string operation)
        {
            var context = new SphDataContext();
            using (var session = context.OpenSession())
            {
                session.Attach(setting);
                await session.SubmitChanges(operation);
            }
        }
    }

    public class EstLoginModel
    {
        public string AccountNo { get; set; }
        public string Email { get; set; }
    }

    public class OstLoginModel
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public bool RememberMe { get; set; }
    }

    public class OstSocialModel
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string Id { get; set; }
        public string PictureUrl { get; set; }
        public string IdToken { get; set; }
        public string Brand { get; set; }
    }

    public class OstRegisterModel
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public string Designation { get; set; }
    }

    public class OstResetPasswordModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public string Id { get; set; }
    }
}