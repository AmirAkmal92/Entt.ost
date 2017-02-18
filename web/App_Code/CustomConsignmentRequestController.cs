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
    }
}