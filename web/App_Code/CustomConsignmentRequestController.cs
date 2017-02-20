using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace web.sph.App_Code
{
    [RoutePrefix("consignment-request")]
    public class CustomConsignmentRequestController: BaseApiController
    {
        [HttpPut]
        [Route("calculate-total-price/{id}")]
        public async Task<IHttpActionResult> CalculateAndSaveTotalPrice(string id)
        {
            var context = new SphDataContext();
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<ConsigmentRequest>>();

            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("ReferenceNo", id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var item = lo.Source;
            decimal total = 0;
            foreach (var consignment in lo.Source.Consignments)
            {
                total += consignment.Produk.Price;
            }
            item.Payment.TotalPrice = total;

            using (var session = context.OpenSession())
            {
                session.Attach(item);
                await session.SubmitChanges("Default");
            }

            var result = new
            {
                success = true,
                status = "OK",
                id = item.Id,
                _link = new
                {
                    rel = "self",
                    href = $"{ConfigurationManager.BaseUrl}/api/consigment-requests/{item.Id}"
                }
            };

            // wait until the worker process it
            await Task.Delay(1000);
            return Accepted(result);
        }

        [HttpGet]
        [Route("generate-px-req-fields/{id}")]
        public async Task<IHttpActionResult> GeneratePxReqFields(string id)
        {
            var pxReq = new PxRexModel();

            var repos = ObjectBuilder.GetObject<IReadonlyRepository<ConsigmentRequest>>();

            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("ReferenceNo", id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);
            var item = lo.Source;

            pxReq.PX_VERSION = "1.1";
            pxReq.PX_TRANSACTION_TYPE = "SALS";
            pxReq.PX_PURCHASE_ID = item.Id;

            //TODO: Set & Get from appSettings 
            var pxMerchantId = 20423109;
            var pxRef = "enet96";

            //TODO: PX_MERCHANT_ID = merchantId + checksum
            pxReq.PX_MERCHANT_ID = pxMerchantId;
            pxReq.PX_PURCHASE_AMOUNT = item.Payment.TotalPrice;

            pxReq.PX_PURCHASE_DATE = DateTime.Now.ToString("ddMMyyyy HH:mm:ss");
            pxReq.PX_REF = pxRef;

            //TODO: generate PX_SIG using provided encryption algorithm
            pxReq.PX_SIG = "todo-enrypted-px-sig";


            var result = new
            {
                success = true,
                status = "OK",
                pxreq = pxReq,
                id = item.Id,
            };

            return Ok(result);
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
}