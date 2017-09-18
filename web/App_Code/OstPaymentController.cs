using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Ost.GeneralLedgers.Domain;
using Bespoke.Ost.UserDetails.Domain;
using Bespoke.Ost.Wallets.Domain;
using Bespoke.Sph.Domain;
using System;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace web.sph.App_Code
{
    [RoutePrefix("ost-payment")]
    public class OstPaymentController : Controller
    {
        private string m_baseUrl;
        private string m_paymentGatewayBaseUrl;
        private string m_paymentGatewayApplicationId;
        private string m_paymentGatewayEncryptionKey;
        private string m_applicationName;

        public OstPaymentController()
        {
            m_baseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
            m_paymentGatewayBaseUrl = ConfigurationManager.GetEnvironmentVariable("PaymentGatewayBaseUrl") ?? "https://www.posonline.com.my";
            m_paymentGatewayApplicationId = ConfigurationManager.GetEnvironmentVariable("PaymentGatewayApplicationId") ?? "OST";
            m_paymentGatewayEncryptionKey = ConfigurationManager.GetEnvironmentVariable("PaymentGatewayEncryptionKey") ?? "WdVxp54wmQlGFBmvOQgfmpAqCJ23gyGI";
            m_applicationName = ConfigurationManager.GetEnvironmentVariable("ApplicationName") ?? "OST";
        }

        [Authorize]
        [HttpGet]
        [Route("ps-request/{id}")]
        public async Task<ActionResult> PsRequest(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source)
            {
                Response.StatusCode = (int)HttpStatusCode.NotFound;
                return Json(new { success = false, status = "ERROR", message = $"Cannot find ConsigmentRequest with Id/ReferenceNo: {id}." }, JsonRequestBehavior.AllowGet);
            }

            var item = lo.Source;
            var model = new PaymentSwitchRequestModel();

            decimal noGstPrice = 0;
            decimal internationalPrice = 0;
            decimal gstPrice = 0;
            foreach (var consignment in item.Consignments)
            {
                if (!consignment.Produk.IsInternational)
                {
                    noGstPrice += consignment.Bill.SubTotal3;
                    gstPrice += (consignment.Bill.SubTotal3 * 0.06m);
                }
                else
                {
                    internationalPrice += consignment.Bill.SubTotal3;
                }
            }

            // pickup charge = RM5.00
            // pickup charge gst = RM0.30
            noGstPrice += 5.00m;
            noGstPrice += internationalPrice;
            gstPrice += 0.30m;

            // required by payment gateway
            model.TransactionId = item.ReferenceNo;
            model.TransactionAmount = noGstPrice;
            model.TransactionGST = gstPrice;
            model.PurchaseDate = DateTime.Now;
            model.Description = $"{m_applicationName} purchase by {item.ChangedBy} for RM{item.Payment.TotalPrice}";
            model.CallbackUrl = $"{m_baseUrl}/ost-payment/ps-response"; //temp for testing

            var rijndaelKey = new RijndaelEnhanced(m_paymentGatewayEncryptionKey);
            var dataToEncrypt = string.Format("{0}|{1}|{2}|{3}|{4}", model.TransactionId, model.TransactionAmount, model.TransactionGST, model.PurchaseDate.ToString("MM/dd/yyyy hh:mm:ss"), model.Description);
            if (!string.IsNullOrEmpty(model.CallbackUrl))
                dataToEncrypt += "|" + model.CallbackUrl;
            var encryptedData = rijndaelKey.Encrypt(dataToEncrypt);

            Response.StatusCode = (int)HttpStatusCode.OK;
            return Json(new { success = true, status = "OK", id = m_paymentGatewayApplicationId, data = encryptedData, url = $"{m_paymentGatewayBaseUrl}/pay" }, JsonRequestBehavior.AllowGet);
        }

        [Authorize]
        [HttpPost]
        [Route("ps-response")]
        public async Task<ActionResult> PsResponse()
        {
            var encryptedData = Request.Form["data"];

            if (string.IsNullOrEmpty(encryptedData))
            {
                return Redirect($"{m_baseUrl}/ost");
            }

            var rijndaelKey = new RijndaelEnhanced(m_paymentGatewayEncryptionKey);
            var decryptedData = rijndaelKey.Decrypt(encryptedData);

            var decryptedDataArr = decryptedData.Split(new char[] { '|' });
            var model = new PaymentSwitchResponseModel();

            model.TransactionId = decryptedDataArr[0];
            model.TransactionAmount = decryptedDataArr[1];
            model.TransactionGST = decryptedDataArr[2];
            model.ServiceFee = decryptedDataArr[3];
            model.ServiceGST = decryptedDataArr[4];
            model.TotalAmount = decryptedDataArr[5];
            model.Status = decryptedDataArr[6];
            model.ErrorMessage = decryptedDataArr[7];

            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(model.TransactionId);
            if (null == lo.Source)
            {
                Response.StatusCode = (int)HttpStatusCode.NotFound;
                return Json(new { success = false, status = "ERROR", message = $"Cannot find ConsigmentRequest with Id/ReferenceNo: {model.TransactionId}." }, JsonRequestBehavior.AllowGet);
            }
            var item = lo.Source;
            if (model.Status.Equals("1"))
            {
                item.Payment.IsPaid = true;
                item.Payment.Status = model.Status;
                item.Payment.Date = DateTime.Now;
                await SaveConsigmentRequest(item);

                // wait until the worker process it
                await Task.Delay(1500);
                return Redirect($"{m_baseUrl}/ost#consignment-request-paid-summary/{item.Id}");
            }
            else
            {
                item.Payment.IsPaid = false;
                item.Payment.Status = model.Status;
                item.Payment.Date = DateTime.Now;
                await SaveConsigmentRequest(item);

                // wait until the worker process it
                await Task.Delay(1500);
                return Redirect($"{m_baseUrl}/ost#consignment-request-summary/{item.Id}");
            }
        }

        [Authorize]
        [HttpGet]
        [Route("ps-request-prepaid/{id}")]
        public async Task<ActionResult> PsRequestPrepaid(string id)
        {
            var context = new SphDataContext();
            LoadData<Wallet> lo = await GetWallet(id);
            if (null == lo.Source)
            {
                Response.StatusCode = (int)HttpStatusCode.NotFound;
                return Json(new { success = false, status = "ERROR", message = $"Cannot find WalletCode with Id: {id}." }, JsonRequestBehavior.AllowGet);
            }

            var generalLedger = new GeneralLedger();
            generalLedger.Id = Guid.NewGuid().ToString();

            var wallet = lo.Source;
            decimal noGstPrice = 0;
            decimal gstPrice = 0;
            decimal totalPrice = 0;
            noGstPrice = Convert.ToDecimal(wallet.TotalValue);
            gstPrice = noGstPrice * Convert.ToDecimal(0.06);
            totalPrice = noGstPrice + gstPrice;

            // required by payment gateway
            var model = new PaymentSwitchRequestModel();
            model.TransactionId = GenerateCustomRefNo(generalLedger);
            model.TransactionAmount = noGstPrice;
            model.TransactionGST = gstPrice;
            model.PurchaseDate = DateTime.Now;
            model.Description = $"{m_applicationName} purchase topup by {User.Identity.Name} for RM{totalPrice} with Id: ({wallet.WalletCode})";
            model.CallbackUrl = $"{m_baseUrl}/ost-payment/ps-response-prepaid";

            //insert empty transaction into GL with reference no and type
            generalLedger.ReferenceNo = model.TransactionId;
            generalLedger.Type = "Prepaid";
            using (var session = context.OpenSession())
            {
                session.Attach(generalLedger);
                await session.SubmitChanges("Default");
            }

            var rijndaelKey = new RijndaelEnhanced(m_paymentGatewayEncryptionKey);
            var dataToEncrypt = string.Format("{0}|{1}|{2}|{3}|{4}", model.TransactionId, model.TransactionAmount, model.TransactionGST, model.PurchaseDate.ToString("MM/dd/yyyy hh:mm:ss"), model.Description);
            if (!string.IsNullOrEmpty(model.CallbackUrl))
                dataToEncrypt += "|" + model.CallbackUrl;
            var encryptedData = rijndaelKey.Encrypt(dataToEncrypt);

            Response.StatusCode = (int)HttpStatusCode.OK;
            return Json(new { success = true, status = "OK", id = m_paymentGatewayApplicationId, data = encryptedData, url = $"{m_paymentGatewayBaseUrl}/pay" }, JsonRequestBehavior.AllowGet);
        }

        [Authorize]
        [HttpPost]
        [Route("ps-response-prepaid")]
        public async Task<ActionResult> PsResponsePrepaid()
        {
            var context = new SphDataContext();
            //TODO: Clean-up unused GLs
            //1. get all GLs owned by current user with (Type == "Prepaid") AND (UserId == null)        
            //2. delete all found GLs

            var encryptedData = Request.Form["data"];

            if (string.IsNullOrEmpty(encryptedData))
            {
                return Redirect($"{m_baseUrl}/ost#wallet-list-all");
            }

            var rijndaelKey = new RijndaelEnhanced(m_paymentGatewayEncryptionKey);
            var decryptedData = rijndaelKey.Decrypt(encryptedData);

            var decryptedDataArr = decryptedData.Split(new char[] { '|' });

            var model = new PaymentSwitchResponseModel();
            model.TransactionId = decryptedDataArr[0];
            model.TransactionAmount = decryptedDataArr[1];
            model.TransactionGST = decryptedDataArr[2];
            model.ServiceFee = decryptedDataArr[3];
            model.ServiceGST = decryptedDataArr[4];
            model.TotalAmount = decryptedDataArr[5];
            model.Status = decryptedDataArr[6];
            model.ErrorMessage = decryptedDataArr[7];
            Console.WriteLine(model.ErrorMessage);

            //get wallet to determine wallet Id as GL correspondingId
            LoadData<Wallet> loWallet = await GetWalletByTotalValue(model.TransactionAmount);
            if (null == loWallet.Source)
            {
                Response.StatusCode = (int)HttpStatusCode.NotFound;
                return Json(new { success = false, status = "ERROR", message = $"Cannot find TransactionAmount with Id: {model.TransactionAmount}." }, JsonRequestBehavior.AllowGet);
            }
            var wallet = loWallet.Source;

            //get userdetail to update AccountBalance
            LoadData<UserDetail> loUserDetail = await GetUserDetail(User.Identity.Name);
            if (null == loUserDetail.Source)
            {
                Response.StatusCode = (int)HttpStatusCode.NotFound;
                return Json(new { success = false, status = "ERROR", message = $"Cannot find UserId with Id: {User.Identity.Name}." }, JsonRequestBehavior.AllowGet);
            }
            var userDetail = loUserDetail.Source;

            //verify reference no from GL (get by reference no)
            LoadData<GeneralLedger> loGeneralLedger = await GetGeneralLedger(model.TransactionId);
            if (null == loGeneralLedger.Source)
            {
                Response.StatusCode = (int)HttpStatusCode.NotFound;
                return Json(new { success = false, status = "ERROR", message = $"Cannot find ReferenceNo with Id: {model.TransactionId}." }, JsonRequestBehavior.AllowGet);
            }
            var generalLedger = loGeneralLedger.Source;

            if (model.Status.Equals("1"))
            {
                //update GeneralLedger
                generalLedger.ReferenceNo = model.TransactionId;
                generalLedger.UserId = User.Identity.Name;
                generalLedger.Type = "Prepaid";
                generalLedger.CorrespondingId = wallet.Id;
                generalLedger.Description = $"{m_applicationName} purchase topup by {User.Identity.Name} for RM{model.TransactionAmount}";
                generalLedger.Amount = Convert.ToDecimal(model.TransactionAmount);
                generalLedger.ExistingAmount = Convert.ToDecimal(userDetail.AccountBalance);
                generalLedger.NewAmount = Convert.ToDecimal(model.TransactionAmount) + Convert.ToDecimal(userDetail.AccountBalance);

                //update UserDetail
                userDetail.AccountBalance = generalLedger.NewAmount;
                
                using (var session = context.OpenSession())
                {
                    session.Attach(generalLedger);
                    session.Attach(userDetail);
                    await session.SubmitChanges("Default");
                }
                await Task.Delay(1500);
                return Redirect($"{m_baseUrl}/ost#wallet-history");
            }
            else
            {
                //fall through
            }

            await Task.Delay(1500);
            return Redirect($"{m_baseUrl}/ost#wallet-list-all");
        }

        private static async Task<LoadData<ConsigmentRequest>> GetConsigmentRequest(string id)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<ConsigmentRequest>>();

            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("ReferenceNo", id);
            return lo;
        }

        private static async Task<LoadData<Wallet>> GetWallet(string id)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<Wallet>>();

            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("WalletCode", id);
            return lo;
        }

        private static async Task<LoadData<Wallet>> GetWalletByTotalValue(string totalValue)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<Wallet>>();
            var lo = await repos.LoadOneAsync("TotalValue", totalValue);
            return lo;
        }

        private static async Task<LoadData<GeneralLedger>> GetGeneralLedger(string id)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<GeneralLedger>>();

            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("ReferenceNo", id);
            return lo;
        }

        private static async Task<LoadData<GeneralLedger>> GetGeneralLedgerByCreatedBy(string createdBy)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<GeneralLedger>>();
            var lo = await repos.LoadOneAsync("CreatedBy", createdBy);
            return lo;
        }

        private static async Task<LoadData<UserDetail>> GetUserDetail(string id)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<UserDetail>>();

            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("UserId", id);
            return lo;
        }

        private static async Task SaveConsigmentRequest(ConsigmentRequest item)
        {
            var context = new SphDataContext();
            using (var session = context.OpenSession())
            {
                session.Attach(item);
                await session.SubmitChanges("Default");
            }
        }

        private string GenerateCustomRefNo(GeneralLedger item)
        {
            var referenceNo = new StringBuilder();
            referenceNo.Append($"{m_applicationName.ToUpper()}-");
            referenceNo.Append(DateTime.Now.ToString("ddMMyy-ss-"));
            referenceNo.Append((item.Id.Split('-'))[1]);
            return referenceNo.ToString();
        }
    }

    public class PaymentSwitchRequestModel
    {
        public string TransactionId { get; set; }
        public decimal TransactionAmount { get; set; }
        public decimal TransactionGST { get; set; }
        public DateTime PurchaseDate { get; set; }
        public string Description { get; set; }
        public string CallbackUrl { get; set; }
    }

    public class PaymentSwitchResponseModel
    {
        public string TransactionId { get; set; }
        public string TransactionAmount { get; set; }
        public string TransactionGST { get; set; }
        public string ServiceFee { get; set; }
        public string ServiceGST { get; set; }
        public string TotalAmount { get; set; }
        public string Status { get; set; }
        public string ErrorMessage { get; set; }
    }
}