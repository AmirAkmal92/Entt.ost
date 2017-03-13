using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using System;
using System.Net;
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

        public OstPaymentController()
        {
            m_baseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
            m_paymentGatewayBaseUrl = ConfigurationManager.GetEnvironmentVariable("PaymentGatewayBaseUrl") ?? "http://testv2paymentgateway.posonline.com.my";
            m_paymentGatewayApplicationId = ConfigurationManager.GetEnvironmentVariable("PaymentGatewayApplicationId") ?? "OST";
            m_paymentGatewayEncryptionKey = ConfigurationManager.GetEnvironmentVariable("PaymentGatewayEncryptionKey") ?? "WdVxp54wmQlGFBmvOQgfmpAqCJ23gyGI";
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

            decimal gstPrice = 0;
            decimal domesticPrice = 0;
            decimal internationalPrice = 0;
            decimal pickupPrice = 5.30m;
            foreach (var consignment in item.Consignments)
            {
                if (consignment.Produk.IsInternational)
                {
                    if (consignment.Produk.Price == 0)
                    {
                        internationalPrice += 0;
                    }
                    else
                    {
                        internationalPrice += consignment.Produk.Price;
                    }
                }
                else
                {
                    if (consignment.Produk.Price == 0)
                    {
                        domesticPrice += 0;
                    }
                    else
                    {
                        domesticPrice += consignment.Produk.Price;
                    }
                }
            }
            gstPrice = decimal.Multiply(decimal.Divide((domesticPrice + pickupPrice), 1.06m), 0.06m);
            
            // required by payment gateway
            model.TransactionId = item.ReferenceNo;
            model.TransactionAmount = item.Payment.TotalPrice - gstPrice;
            model.TransactionGST = gstPrice;
            model.PurchaseDate = DateTime.Now;
            model.Description = $"OST purchase by {item.ChangedBy} for RM{item.Payment.TotalPrice}";
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
                item.Payment.Date = DateTime.Now;
                await SaveConsigmentRequest(item);

                // wait until the worker process it
                await Task.Delay(1500);
                return Redirect($"{m_baseUrl}/ost#consignment-request-paid-summary/{item.Id}");
            }
            else
            {
                item.Payment.IsPaid = false;
                await SaveConsigmentRequest(item);

                // wait until the worker process it
                await Task.Delay(1500);
                return Redirect($"{m_baseUrl}/ost#consignment-request-summary/{item.Id}");
            }
        }

        private static async Task<LoadData<ConsigmentRequest>> GetConsigmentRequest(string id)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<ConsigmentRequest>>();

            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("ReferenceNo", id);
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