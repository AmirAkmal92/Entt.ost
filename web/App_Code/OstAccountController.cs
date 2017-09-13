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

                    if (!string.IsNullOrEmpty(profile.Designation))
                    {
                        if (profile.Designation.Equals("No contract customer")
                            || profile.Designation.Equals("Contract customer"))
                        {
                            if (returnUrl == "/" ||
                                returnUrl.Equals("/ost", StringComparison.InvariantCultureIgnoreCase) ||
                                returnUrl.Equals("/ost#", StringComparison.InvariantCultureIgnoreCase) ||
                                returnUrl.Equals("/ost/", StringComparison.InvariantCultureIgnoreCase) ||
                                returnUrl.Equals("/ost/#", StringComparison.InvariantCultureIgnoreCase) ||
                                string.IsNullOrWhiteSpace(returnUrl))
                                return Redirect("/ost#" + profile.StartModule);
                        }
                    }
                    return Redirect("/sph");
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

            model.FullName = model.UserName;
            var result = await CreateAccount(model);
            if (!result.Success)
            {
                return RedirectToAction("register", "ost-account", new { success = result.Success, status = result.Status });
            }

            var emailModel = new OstCreateEmailModel
            {
                UserEmail = model.Email,
                UserName = model.UserName,
                EmailSubject = "Verify your email address",
                EmailBody = $"To finish setting up this {ConfigurationManager.ApplicationFullName} account, we just need to make sure this email address is yours."
            };
            await SendVerificationEmail(emailModel);

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
                var item = JsonConvert.DeserializeObject<EstRegisterModel>(output);
                var encodedEmail = Convert.ToBase64String(Encoding.UTF8.GetBytes(item.EmailAddress));
                if (step == 1)
                {
                    if (model.AccountNo == item.AccountNo)
                    {
                        if (item.AccountStatus == 0)
                        {
                            if (item.EmailAddress != null)
                            {
                                if (IsValidEmail(item.EmailAddress))
                                {
                                    return RedirectToAction("first-time-login/step/2", "ost-account", new { accNo = item.AccountNo, email = encodedEmail });
                                }
                                else
                                {
                                    return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your registered email address is invalid. {errorMessage}", accNo = item.AccountNo, email = encodedEmail });
                                }
                            }
                            else
                            {
                                return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your registered email address is invalid. {errorMessage}", accNo = item.AccountNo, email = encodedEmail });
                            }
                        }
                        else if (item.AccountStatus == 1)
                        {
                            return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your account has been blocked. {errorMessage}", accNo = item.AccountNo, email = encodedEmail });
                        }
                        else
                        {
                            return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your account has been terminated. {errorMessage}", accNo = item.AccountNo, email = encodedEmail });
                        }
                    }
                    else
                    {
                        return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your account number is invalid. {errorMessage}", accNo = item.AccountNo, email = encodedEmail });
                    }
                }
                else if (step == 2)
                {
                    if (IsValidEmail(model.EmailAddress) && IsValidEmail(item.EmailAddress))
                    {
                        if ((model.EmailAddress != item.EmailAddress)
                            || (model.AccountNo != item.AccountNo))
                        {
                            return RedirectToAction("first-time-login/step/2", "ost-account", new { success = false, status = $"Your email address cannot be verified. {errorMessage}", accNo = item.AccountNo, email = encodedEmail });
                        }
                    }
                    else
                    {
                        return RedirectToAction("first-time-login/step/1", "ost-account", new { success = false, status = $"Your registered email address is invalid. {errorMessage}", accNo = item.AccountNo, email = encodedEmail });
                    }

                    //register customer as Ezisend user; designation - "Contract customer"
                    string password = Membership.GeneratePassword(8, 1);
                    var registerModel = new OstRegisterModel
                    {
                        UserName = model.AccountNo,
                        FullName = item.CustomerName,
                        Password = password,
                        ConfirmPassword = password,
                        Email = model.EmailAddress,
                        Designation = "Contract customer"
                    };
                    var result = await CreateAccount(registerModel);
                    if (!result.Success)
                    {
                        return RedirectToAction("first-time-login/step/1", "ost-account", new { success = result.Success, status = result.Status, accNo = item.AccountNo, email = encodedEmail });
                    }

                    var emailModel = new OstCreateEmailModel
                    {
                        UserEmail = registerModel.Email,
                        UserName = registerModel.UserName,
                        EmailSubject = "Create your password",
                        EmailBody = $"Thank you for registering as a Pos Laju Business Customer user at {ConfigurationManager.ApplicationFullName}. To complete your account registration, you must create a new password.",
                    };
                    await SendForgotPasswordEmail(emailModel);

                    //create user details
                    var context = new SphDataContext();
                    var userDetail = new Bespoke.Ost.UserDetails.Domain.UserDetail();
                    var guid = Guid.NewGuid().ToString();
                    userDetail.Id = guid;
                    userDetail.UserId = registerModel.UserName;
                    userDetail.Profile.CompanyName = item.CompanyName;
                    userDetail.Profile.ContactPerson = item.CustomerName;
                    userDetail.ProfilePictureUrl = "/assets/admin/pages/img/avatars/user_default.png";
                    userDetail.Profile.ContactInformation.Email = registerModel.Email;
                    userDetail.Profile.ContactInformation.ContactNumber = item.ContactNo;
                    userDetail.Profile.ContactInformation.AlternativeContactNumber = item.AltContactNo;

                    userDetail.Profile.Address.Address1 = item.Address.Address1;
                    userDetail.Profile.Address.Address2 = item.Address.Address2;
                    userDetail.Profile.Address.Address3 = item.Address.Address3;
                    userDetail.Profile.Address.Address4 = $"{item.Address.Address4} {item.Address.Address5}";
                    userDetail.Profile.Address.City = item.Address.City;
                    userDetail.Profile.Address.State = item.Address.State;
                    userDetail.Profile.Address.Country = "MY"; //item.Address.Country;
                    userDetail.Profile.Address.Postcode = item.Address.Postcode;

                    userDetail.PickupAddress.Address.Address1 = item.PickupAddress.Address1;
                    userDetail.PickupAddress.Address.Address2 = item.PickupAddress.Address2;
                    userDetail.PickupAddress.Address.Address3 = item.PickupAddress.Address3;
                    userDetail.PickupAddress.Address.Address4 = $"{item.PickupAddress.Address4} {item.PickupAddress.Address5}";
                    userDetail.PickupAddress.Address.City = item.PickupAddress.City;
                    userDetail.PickupAddress.Address.State = item.PickupAddress.State;
                    userDetail.PickupAddress.Address.Country = "MY"; //item.PickupAddress.Country;
                    userDetail.PickupAddress.Address.Postcode = item.PickupAddress.Postcode;

                    userDetail.BillingAddress.Address.Address1 = item.BillingAddress.Address1;
                    userDetail.BillingAddress.Address.Address2 = item.BillingAddress.Address2;
                    userDetail.BillingAddress.Address.Address3 = item.BillingAddress.Address3;
                    userDetail.BillingAddress.Address.Address4 = $"{item.BillingAddress.Address4} {item.BillingAddress.Address5}";
                    userDetail.BillingAddress.Address.City = item.BillingAddress.City;
                    userDetail.BillingAddress.Address.State = item.BillingAddress.State;
                    userDetail.BillingAddress.Address.Country = "MY"; //item.BillingAddress.Country;
                    userDetail.BillingAddress.Address.Postcode = item.BillingAddress.Postcode;

                    using (var session = context.OpenSession())
                    {
                        session.Attach(userDetail);
                        await session.SubmitChanges("Default");
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
        public async Task<ActionResult> RegisterEst(string email)
        {
            if (string.IsNullOrEmpty(email))
                return RedirectToAction("register-est", "ost-account", new { success = false, status = "Email cannot be set to null or empty." });

            //TODO: Check with SnB if email existed proceed to first time login
            //if (true)
            //{
            //    //return RedirectToAction("register-est", "ost-account", new { success = false, status = $"Your email address {email} already existed. You may proceed to first time login." });
            //}

            var emailModel = new OstCreateEmailModel
            {
                UserEmail = email,
                UserName = email,
                EmailSubject = "New Pos Laju Business Customer Registration",
                EmailBody = $"You're only one step away from becoming a Pos Laju Business Customer user at {ConfigurationManager.ApplicationFullName}. Just click on the following link to complete our online registration form and you`re almost there!"
            };
            await SendEstRegistrationEmail(emailModel);

            return RedirectToAction("success", "ost-account", new { success = true, status = "OK", operation = "register-est" });
        }

        [AllowAnonymous]
        [Route("register-est-user/{id}")]
        public async Task<ActionResult> EstRegistration(string id, bool success = true, string status = "OK")
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

            if (!setting.Key.Equals("EstRegistration"))
            {
                ViewBag.success = false;
                ViewBag.status = "The link is not associated with EST Registration Form.";
                return View();
            }

            var logger = ObjectBuilder.GetObject<ILogger>();

            var directory = ObjectBuilder.GetObject<IDirectoryService>();
            var tempUsername = "registrar";
            var tempPassword = "r3g1str4r";
            if (await directory.AuthenticateAsync(tempUsername, tempPassword))
            {
                var identity = new ClaimsIdentity(ConfigurationManager.ApplicationName + "Cookie");
                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, tempUsername));
                identity.AddClaim(new Claim(ClaimTypes.Name, tempUsername));
                var roles = Roles.GetRolesForUser(tempUsername).Select(x => new Claim(ClaimTypes.Role, x));
                identity.AddClaims(roles);

                var profile = await context.LoadOneAsync<UserProfile>(u => u.UserName == tempUsername);
                await logger.LogAsync(new LogEntry { Log = EventLog.Security });
                if (null != profile)
                {
                    var claims = profile.GetClaims();
                    identity.AddClaims(claims);

                    HttpContext.GetOwinContext().Authentication.SignIn(identity);

                    if (!string.IsNullOrEmpty(profile.Designation))
                    {
                        if (profile.Designation.Equals("Contract customer registrar"))
                        {
                            return Redirect($"/ost#est-registration-form/0/sid/{setting.Id}");
                        }
                    }
                    return Redirect("/");
                }
            }
            return Redirect("/");
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
            await SetVerifyEmailFlag(username);

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

            var emailModel = new OstCreateEmailModel
            {
                UserEmail = email,
                UserName = username,
                EmailSubject = "Forgot your password",
                EmailBody = $"You're receiving this e-mail because you requested a password reset for your user account at {ConfigurationManager.ApplicationFullName}.",
            };
            await SendForgotPasswordEmail(emailModel);

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
        public async Task<ActionResult> ResetPassword(OstResetPasswordModel model)
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

            await SetVerifyEmailFlag(username);

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

            var emailModel = new OstCreateEmailModel
            {
                UserEmail = email,
                UserName = username,
                EmailSubject = "Verify your email address",
                EmailBody = $"To finish setting up this {ConfigurationManager.ApplicationFullName} account, we just need to make sure this email address is yours."
            };
            await SendVerificationEmail(emailModel);

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
                string strippedName = new string(model.Name.ToCharArray()
                    .Where(c => !char.IsWhiteSpace(c))
                    .ToArray()).ToLower();
                Random rnd = new Random();
                int rndTail = rnd.Next(1000, 10000);
                var newUserName = strippedName + rndTail.ToString();
                string password = Membership.GeneratePassword(8, 1);

                var registerModel = new OstRegisterModel
                {
                    UserName = newUserName,
                    FullName = model.Name,
                    Email = model.Email,
                    Password = password,
                    ConfirmPassword = password,
                    Designation = "No contract customer"
                };
                var result = await CreateAccount(registerModel);
                if (!result.Success)
                {
                    Response.StatusCode = (int)HttpStatusCode.Accepted;
                    return Json(new { success = result.Success, status = "ERROR", message = result.Status });
                }

                var emailModel = new OstCreateEmailModel
                {
                    UserEmail = registerModel.Email,
                    UserName = registerModel.UserName,
                    EmailSubject = "Verify your email address",
                    EmailBody = $"To finish setting up this {ConfigurationManager.ApplicationFullName} account, we just need to make sure this email address is yours."
                };
                await SendVerificationEmail(emailModel);

                //create user details
                var context = new SphDataContext();
                var userDetail = new Bespoke.Ost.UserDetails.Domain.UserDetail();
                var guid = Guid.NewGuid().ToString();
                userDetail.Id = guid;
                userDetail.UserId = registerModel.UserName;
                userDetail.Profile.ContactPerson = registerModel.FullName;
                userDetail.ProfilePictureUrl = model.PictureUrl;
                userDetail.Profile.ContactInformation.Email = registerModel.Email;
                userDetail.Profile.Address.Country = "MY";
                using (var session = context.OpenSession())
                {
                    session.Attach(userDetail);
                    await session.SubmitChanges("Default");
                }

                Response.StatusCode = (int)HttpStatusCode.OK;
                return Json(new { success = true, status = "OK", message = $"User {registerModel.UserName} with email {registerModel.Email} has been registered." });
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

        private static async Task<OstRegisterStatusModel> CreateAccount(OstRegisterModel model)
        {
            var result = new OstRegisterStatusModel
            {
                Success = true,
                Status = "OK"
            };

            Profile profile = new Profile();
            profile.UserName = model.UserName;
            profile.FullName = model.FullName;
            profile.Email = model.Email;
            profile.Password = model.Password;

            var context = new SphDataContext();
            var designation = await context.LoadOneAsync<Designation>(d => d.Name == model.Designation);
            if (null == designation)
            {
                result.Success = false;
                result.Status = $"Cannot find designation {model.Designation}";
                return result;
            }

            profile.Designation = model.Designation;
            profile.Roles = designation.RoleCollection.ToArray();

            var em = Membership.GetUser(profile.UserName);
            if (null != em)
            {
                result.Success = false;
                result.Status = $"User {profile.UserName} already exist.";
                return result;
            }

            try
            {
                Membership.CreateUser(profile.UserName, profile.Password, profile.Email);
            }
            catch (MembershipCreateUserException ex)
            {
                ObjectBuilder.GetObject<ILogger>().Log(new LogEntry(ex));
                result.Success = false;
                result.Status = ex.Message;
                return result;
            }

            Roles.AddUserToRoles(profile.UserName, profile.Roles);
            await CreateProfile(profile, designation);

            return result;
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

        private static async Task SendVerificationEmail(OstCreateEmailModel model)
        {
            var setting = new Setting
            {
                UserName = model.UserEmail,
                Key = "VerifyEmail",
                Value = DateTime.Now.ToString("s"),
                Id = Strings.GenerateId()
            };
            await SaveSetting(setting, "VerifyEmail");

            var emailSubject = $"{ConfigurationManager.ApplicationFullName} - {model.EmailSubject}";
            var emailBody = $@"Hello {model.UserName},

{model.EmailBody}
Please click the link below to proceed.
    {ConfigurationManager.BaseUrl}/ost-account/verify-email/{setting.Id}";

            await SendEmail(model.UserEmail, emailSubject, emailBody);
        }

        private static async Task SendForgotPasswordEmail(OstCreateEmailModel model)
        {
            var setting = new Setting
            {
                UserName = model.UserEmail,
                Key = "ForgotPassword",
                Value = DateTime.Now.ToString("s"),
                Id = Strings.GenerateId()
            };
            await SaveSetting(setting, "ForgotPassword");

            var emailSubject = $"{ConfigurationManager.ApplicationFullName} - {model.EmailSubject}";
            var emailBody = $@"Hello {model.UserName},

{model.EmailBody}
Please click the link below to proceed.
    {ConfigurationManager.BaseUrl}/ost-account/reset-password/{setting.Id}";

            await SendEmail(model.UserEmail, emailSubject, emailBody);
        }

        private static async Task SendEstRegistrationEmail(OstCreateEmailModel model)
        {
            var setting = new Setting
            {
                UserName = model.UserEmail,
                Key = "EstRegistration",
                Value = DateTime.Now.ToString("s"),
                Id = Strings.GenerateId()
            };
            await SaveSetting(setting, "EstRegistration");

            var emailSubject = $"{ConfigurationManager.ApplicationFullName} - {model.EmailSubject}";
            var emailBody = $@"Hello {model.UserName},

{model.EmailBody}
Please click the link below to proceed.
    {ConfigurationManager.BaseUrl}/ost-account/register-est-user/{setting.Id}";

            await SendEmail(model.UserEmail, emailSubject, emailBody);
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

        private static async Task SetVerifyEmailFlag(string username)
        {
            var context = new SphDataContext();
            var userProfile = await context.LoadOneAsync<UserProfile>(p => p.UserName == username);
            if (!userProfile.HasChangedDefaultPassword)
            {
                userProfile.HasChangedDefaultPassword = true;
                using (var session = context.OpenSession())
                {
                    session.Attach(userProfile);
                    await session.SubmitChanges();
                }
            }
        }

        private static bool IsValidEmail(string emailAddress)
        {
            var regex = new Regex(@"([a-z0-9][-a-z0-9_\+\.]*[a-z0-9])@([a-z0-9][-a-z0-9\.]*[a-z0-9]\.(arpa|root|aero|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)|([0-9]{1,3}\.{3}[0-9]{1,3}))");
            return regex.IsMatch(emailAddress);
        }
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
        public string FullName { get; set; }
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

    public class OstRegisterStatusModel
    {
        public bool Success { get; set; }
        public string Status { get; set; }
    }

    public class OstCreateEmailModel
    {
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
    }
}