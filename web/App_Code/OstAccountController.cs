using Bespoke.Sph.Domain;
using Newtonsoft.Json;
using ServiceStack;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace web.sph.App_Code
{
    [RoutePrefix("ost-account")]
    public class OstAccountController : Controller
    {
        private HttpClient m_baseUrlClient;
        public OstAccountController()
        {
            m_baseUrlClient = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230") };
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
        [Route("first-time-login/step/{step}")]
        public ActionResult FirstTimeLogin(int step = 1, bool success = true, string status = "OK", string accNo = "", string email = "")
        {
            ViewBag.step = step;
            ViewBag.success = success;
            ViewBag.status = status;

            var encodedEmail = Convert.ToBase64String(Encoding.UTF8.GetBytes(email));
            var decodedEmail = string.Empty;
            try
            {
                decodedEmail = Encoding.UTF8.GetString(Convert.FromBase64String(email));
            }
            catch (Exception)
            {
                return RedirectToAction("first-time-login/step/1", "ost-account");
            }
            var estData = new EstUserInputModel
            {
                AccountNo = accNo
            };
            if (step == 2)
            {
                if (!IsValidEmail(decodedEmail))
                {
                    return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your registered email address is invalid.", accNo = accNo, email = encodedEmail });
                }
                var tempEmail = Regex.Split(decodedEmail, "@");
                for (var i = 0; i < decodedEmail.Length; i++)
                {
                    var frontEmail = tempEmail[0];
                    var changeFront = frontEmail.Substring(2, (frontEmail.Length - 3));
                    var hashedFront = Regex.Replace(changeFront, @"[\w]", "*");
                    string frontEmailAfter = frontEmail.Substring(0, 2) + hashedFront + frontEmail.Substring(frontEmail.Length - 1);

                    var endEmail = tempEmail[1];
                    var changeEnd = endEmail.Substring(2, (endEmail.Length - 4));
                    var hashedEnd = Regex.Replace(changeEnd, @"[\w]", "*");
                    string endEmailAfter = endEmail.Substring(0, 2) + hashedEnd + endEmail.Substring(endEmail.Length - 2);

                    estData.HintEmailAddress = (frontEmailAfter + "@" + endEmailAfter);
                }
            }
            return View(estData);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("first-time-login/step/{step}")]
        public async Task<ActionResult> FirstTimeLogin(int step, EstUserInputModel model)
        {
            var pointingUrl = $"/api/est-registration/" + model.AccountNo;
            var outputString = await m_baseUrlClient.GetAsync(pointingUrl);
            var output = string.Empty;
            var errorMessage = "Please go to the nearest Pusat Pos Laju (PPL) to reactivate your account.";
            if (outputString.IsSuccessStatusCode)
            {
                output = await outputString.Content.ReadAsStringAsync();
                var items = JsonConvert.DeserializeObject<EstRegisterModel>(output);
                var encodedEmail = Convert.ToBase64String(Encoding.UTF8.GetBytes(items.EmailAddress));
                if (step == 1)
                {
                    if (model.AccountNo == items.AccountNo)
                    {
                        if (items.AccountStatus == 0)
                        {
                            if (items.EmailAddress != null)
                            {
                                if (IsValidEmail(items.EmailAddress))
                                {
                                    return RedirectToAction("first-time-login/step/2", "ost-account", new { accNo = items.AccountNo, email = encodedEmail });
                                }
                                else
                                {
                                    return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your registered email address is invalid. {errorMessage}", accNo = items.AccountNo, email = encodedEmail });
                                }
                            }
                            else
                            {
                                return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your registered email address is invalid. {errorMessage}", accNo = items.AccountNo, email = encodedEmail });
                            }
                        }
                        else if (items.AccountStatus == 1)
                        {
                            return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your account has been blocked. {errorMessage}", accNo = items.AccountNo, email = encodedEmail });
                        }
                        else
                        {
                            return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your account has been terminated. {errorMessage}", accNo = items.AccountNo, email = encodedEmail });
                        }
                    }
                    else
                    {
                        return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your account number is invalid. {errorMessage}", accNo = items.AccountNo, email = encodedEmail });
                    }
                }
                else if (step == 2)
                {
                    if (IsValidEmail(model.EmailAddress) && IsValidEmail(items.EmailAddress))
                    {
                        if ((model.EmailAddress != items.EmailAddress)
                            || (model.AccountNo != items.AccountNo))
                        {
                            return RedirectToAction("first-time-login/step/2", "ost-account", new { success = false, status = $"Your email address cannot be verified. {errorMessage}", accNo = items.AccountNo, email = encodedEmail });
                        }
                    }
                    else
                    {
                        return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your registered email address is invalid. {errorMessage}", accNo = items.AccountNo, email = encodedEmail });
                    }
                    return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "register" });
                }
            }
            else
            {
                return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Account number {model.AccountNo} is not exist. {errorMessage}" });
            }
            return RedirectToAction("first-time-login/step/1", "ost-account");
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

        private static bool IsValidEmail(string emailAddress)
        {
            var regex = new Regex(@"([a-z0-9][-a-z0-9_\+\.]*[a-z0-9])@([a-z0-9][-a-z0-9\.]*[a-z0-9]\.(arpa|root|aero|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)|([0-9]{1,3}\.{3}[0-9]{1,3}))");
            return regex.IsMatch(emailAddress);
        }
    }

    public class EstUserInputModel
    {
        public string AccountNo { get; set; }
        public string EmailAddress { get; set; }
        public string HintEmailAddress { get; set; }
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