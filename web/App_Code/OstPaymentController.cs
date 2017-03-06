using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Xml.Serialization;

namespace web.sph.App_Code
{
    [RoutePrefix("ost-payment")]
    public class OstPaymentController : Controller
    {

        [AllowAnonymous]
        [HttpPost]
        [Route("payment-gateway")]
        public ActionResult PaymentGateway(PxRexModel model)
        {
            // MOCK UP
            ViewBag.Title = "Payment Gateway";
            return View(model);
        }

        [HttpPost]
        [Route("payment-accepted")]
        public async Task<ActionResult> PaymentAccepted(PxResModel model)
        {
            var baseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl");
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(model.PX_PURCHASE_ID);
            if (null == lo.Source) return HttpNotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + model.PX_PURCHASE_ID);
            var item = lo.Source;

            // MOCK UP
            item.Payment.IsPaid = true;
            item.Payment.Date = DateTime.Now;
            await SaveConsigmentRequest(item);

            // wait until the worker process it
            await Task.Delay(1500);
            return Redirect(baseUrl + "/ost#consignment-request-paid-summary/" + model.PX_PURCHASE_ID);
        }

        [HttpPost]
        [Route("payment-rejected")]
        public async Task<ActionResult> PaymentRejected(PxResModel model)
        {
            var baseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl");
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(model.PX_PURCHASE_ID);
            if (null == lo.Source) return HttpNotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + model.PX_PURCHASE_ID);
            var item = lo.Source;

            // MOCK UP
            item.Payment.IsPaid = false;
            await SaveConsigmentRequest(item);

            // wait until the worker process it
            await Task.Delay(1500);
            return Redirect(baseUrl + "/ost#consignment-request-summary/" + model.PX_PURCHASE_ID);
        }

        [HttpPost]
        [Route("px-res")]
        public async Task<ActionResult> PxRes(PxResModel model)
        {
            var baseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl");
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(model.PX_PURCHASE_ID);
            if (null == lo.Source)
                return HttpNotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + model.PX_PURCHASE_ID);

            var item = lo.Source;

            // TODO: validate model.PX_SIG

            if (model.PX_ERROR_CODE == "000")
            {
                // transaction is successfull
                // TODO: store related PxRes parameters in item
                item.Payment.IsPaid = true;
                item.Payment.Date = DateTime.Now;
            }
            else
            {
                // error
                // TODO: store related PxRes parameters  in item
                item.Payment.IsPaid = false;
            }

            await SaveConsigmentRequest(item);
            return Redirect(baseUrl + "/ost#consignment-request-paid-summary/" + model.PX_PURCHASE_ID);
        }

        [HttpPost]
        [Route("px-inquiry-res")]
        public async Task<ActionResult> PxInquiryRes(PxInquiryResModel model)
        {
            var baseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl");
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(model.PX_PURCHASE_ID);
            if (null == lo.Source)
                return HttpNotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + model.PX_PURCHASE_ID);

            var item = lo.Source;

            if (model.PX_ERROR_CODE == "000")
            {
                // transaction is successfull
                // TODO: store related PxInquiryRes parameters in item
            }
            else
            {
                // error
                // TODO: store related PxInquiryRes parameters  in item
            }

            await SaveConsigmentRequest(item);
            return Redirect(baseUrl + "/ost#consignment-request-paid-summary/" + model.PX_PURCHASE_ID);
        }

        [HttpPost]
        [Route("px-void-res")]
        public async Task<ActionResult> PxVoidRes(PxVoidResModel model)
        {
            var baseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl");
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(model.PX_PURCHASE_ID);
            if (null == lo.Source)
                return HttpNotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + model.PX_PURCHASE_ID);

            var item = lo.Source;

            if (model.PX_ERROR_CODE == "000")
            {
                // transaction is successfull
                // TODO: store related PxVoidRes parameters in item
            }
            else
            {
                // error
                // TODO: store related PxVoidRes parameters  in item
            }

            await SaveConsigmentRequest(item);
            return Redirect(baseUrl + "/ost#consignment-request-paid-summary/" + model.PX_PURCHASE_ID);
        }

        [HttpPost]
        [Route("px-res-notify")]
        public async Task<ActionResult> PxResNotify(PxResNotifyModel model)
        {
            var baseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl");

            XmlSerializer serializer = new XmlSerializer(typeof(PxResNotify));
            StringReader rdr = new StringReader(model.PX_INQ_REQ);
            PxResNotify pxResNotify = (PxResNotify)serializer.Deserialize(rdr);

            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(pxResNotify.PX_PURCHASE_ID);
            if (null == lo.Source)
                return HttpNotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + pxResNotify.PX_PURCHASE_ID);

            var item = lo.Source;

            // TODO: store related PxResNotify parameters in item

            await SaveConsigmentRequest(item);
            return Redirect(baseUrl + "/ost#consignment-request-paid-summary/" + pxResNotify.PX_PURCHASE_ID);
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

    public class PxRexModel
    {
        public string PX_VERSION { get; set; }
        public string PX_TRANSACTION_TYPE { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public long PX_PAN { get; set; }
        public string PX_EXPIRY { get; set; }
        public int PX_MERCHANT_ID { get; set; }
        public decimal PX_PURCHASE_AMOUNT { get; set; }
        public string PX_PURCHASE_DESCRIPTION { get; set; }
        public string PX_PURCHASE_DATE { get; set; }
        public int PX_CVV2 { get; set; }
        public string PX_CUSTOM_FIELD1 { get; set; }
        public string PX_CUSTOM_FIELD2 { get; set; }
        public string PX_CUSTOM_FIELD3 { get; set; }
        public string PX_CUSTOM_FIELD4 { get; set; }
        public string PX_CUSTOM_FIELD5 { get; set; }
        public string PX_REF { get; set; }
        public string PX_ALT_URL { get; set; }
        public string PX_POLICY_NO { get; set; }
        public string PX_SIG { get; set; }
    }

    public class PxResModel
    {
        public string PX_VERSION { get; set; }
        public string PX_TRANSACTION_TYPE { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public long PX_PAN { get; set; }
        public decimal PX_PURCHASE_AMOUNT { get; set; }
        public string PX_PURCHASE_DATE { get; set; }
        public string PX_HOST_DATE { get; set; }
        public string PX_ERROR_CODE { get; set; }
        public string PX_ERROR_DESCRIPTION { get; set; }
        public string PX_APPROVAL_CODE { get; set; }
        public string PX_RRN { get; set; }
        public string PX_3D_FLAG { get; set; }
        public string PX_CUSTOM_FIELD1 { get; set; }
        public string PX_CUSTOM_FIELD2 { get; set; }
        public string PX_CUSTOM_FIELD3 { get; set; }
        public string PX_CUSTOM_FIELD4 { get; set; }
        public string PX_CUSTOM_FIELD5 { get; set; }
        public string PX_SIG { get; set; }
    }

    public class PxCaptureReqModel
    {
        public string PX_VERSION { get; set; }
        public string PX_TRANSACTION_TYPE { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public long PX_PAN { get; set; }
        public string PX_EXPIRY { get; set; }
        public int PX_MERCHANT_ID { get; set; }
        public decimal PX_PURCHASE_AMOUNT { get; set; }
        public string PX_PURCHASE_DESCRIPTION { get; set; }
        public string PX_PURCHASE_DATE { get; set; }
        public int PX_CVV2 { get; set; }
        public string PX_CUSTOM_FIELD1 { get; set; }
        public string PX_CUSTOM_FIELD2 { get; set; }
        public string PX_CUSTOM_FIELD3 { get; set; }
        public string PX_CUSTOM_FIELD4 { get; set; }
        public string PX_CUSTOM_FIELD5 { get; set; }
        public string PX_REF { get; set; }
        public string PX_ALT_URL { get; set; }
        public string PX_POLICY_NO { get; set; }
        public string PX_SIG { get; set; }
    }

    public class PxCaptureResModel
    {
        public string PX_VERSION { get; set; }
        public string PX_TRANSACTION_TYPE { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public long PX_PAN { get; set; }
        public decimal PX_PURCHASE_AMOUNT { get; set; }
        public string PX_TRANSACTION_DATE { get; set; }
        public string PX_HOST_DATE { get; set; }
        public string PX_ERROR_CODE { get; set; }
        public string PX_ERROR_DESCRIPTION { get; set; }
        public string PX_APPROVAL_CODE { get; set; }
        public string PX_RRN { get; set; }
        public string PX_3D_FLAG { get; set; }
        public string PX_CUSTOM_FIELD1 { get; set; }
        public string PX_CUSTOM_FIELD2 { get; set; }
        public string PX_CUSTOM_FIELD3 { get; set; }
        public string PX_CUSTOM_FIELD4 { get; set; }
        public string PX_CUSTOM_FIELD5 { get; set; }
        public string PX_SIG { get; set; }
    }

    public class PxInquiryReqModel
    {
        public string PX_VERSION { get; set; }
        public string PX_TRANSACTION_TYPE { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public int PX_MERCHANT_ID { get; set; }
        public string PX_REF { get; set; }
        public string vcc_action { get; set; }
    }

    public class PxInquiryResModel
    {
        public string PX_VERSION { get; set; }
        public string PX_TRANSACTION_TYPE { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public long PX_PAN { get; set; }
        public decimal PX_PURCHASE_AMOUNT { get; set; }
        public string PX_TRANSACTION_DATE { get; set; }
        public string PX_HOST_DATE { get; set; }
        public string PX_ERROR_CODE { get; set; }
        public string PX_ERROR_DESCRIPTION { get; set; }
        public string PX_APPROVAL_CODE { get; set; }
        public string PX_RRN { get; set; }
        public string PX_3D_FLAG { get; set; }
        public string PX_CUSTOM_FIELD1 { get; set; }
        public string PX_CUSTOM_FIELD2 { get; set; }
        public string PX_CUSTOM_FIELD3 { get; set; }
        public string PX_CUSTOM_FIELD4 { get; set; }
        public string PX_CUSTOM_FIELD5 { get; set; }
    }

    public class PxVoidReqModel
    {
        public string PX_VERSION { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public string PX_TRANSACTION_TYPE { get; set; }
        public int PX_MERCHANT_ID { get; set; }
        public string PX_REF { get; set; }
        public string vcc_action { get; set; }
        public string PX_VOID_DATE { get; set; }
    }

    public class PxVoidResModel {
        public string PX_VERSION { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public long PX_PAN { get; set; }
        public decimal PX_PURCHASE_AMOUNT { get; set; }
        public string PX_TRANSACTION_DATE { get; set; }
        public string PX_HOST_DATE { get; set; }
        public string PX_ERROR_CODE { get; set; }
        public string PX_ERROR_DESCRIPTION { get; set; }
    }

    public class PxResNotifyModel
    {
        public string PX_INQ_REQ { get; set; }
    }

    public class PxResNotify
    {
        public string PX_VERSION { get; set; }
        public int PX_MERCHANT_ID { get; set; }
        public string PX_TRANSACTION_TYPE { get; set; }
        public string PX_PURCHASE_ID { get; set; }
        public long PX_PAN { get; set; }
        public decimal PX_PURCHASE_AMOUNT { get; set; }
        public string PX_TRANSACTION_DATE { get; set; }
        public string PX_HOST_DATE { get; set; }
        public string PX_ERROR_CODE { get; set; }
        public string PX_ERROR_DESCRIPTION { get; set; }
        public string PX_APPROVAL_CODE { get; set; }
        public string PX_RRN { get; set; }
        public string PX_3D_FLAG { get; set; }
        public string PX_CUSTOM_FIELD1 { get; set; }
        public string PX_CUSTOM_FIELD2 { get; set; }
        public string PX_CUSTOM_FIELD3 { get; set; }
        public string PX_CUSTOM_FIELD4 { get; set; }
        public string PX_CUSTOM_FIELD5 { get; set; }
    }
}