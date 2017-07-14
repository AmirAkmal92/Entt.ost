using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace web.sph.App_Code
{
    [RoutePrefix("ost")]
    public class OstHomeController : Controller
    {
        [Route("")]
        public async Task<ActionResult> Index()
        {
            if (!User.Identity.IsAuthenticated)
                return RedirectToAction("Login", "OstAccount");

            UserProfile userProfile = await GetDesignation();

            var userDetail = new UserTypeModel
            {
                Designation = userProfile.Designation
            };

            return View("Default", userDetail);
        }

        [HttpGet]
        [Route("print-domestic-connote/consignment-requests/{crId}/consignments/{cId}")]
        public async Task<ActionResult> DomesticConnote(string crId, string cId)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(crId);
            var item = lo.Source;
            var connote = new Consignment();
            foreach (var consignment in item.Consignments)
            {
                if (consignment.WebId == cId)
                {
                    connote = consignment;
                    break;
                }
            }
            UserProfile userProfile = await GetDesignation();
            var pcm = new printConnoteModel
            {
                referenceNo = item.ReferenceNo,
                consignment = connote,
                accountNo = item.CreatedBy,
                amountPaid = item.Payment.TotalPrice,
                designation = userProfile.Designation,
            };
            return View(pcm);
        }

        [HttpGet]
        [Route("print-international-connote/consignment-requests/{crId}/consignments/{cId}")]
        public async Task<ActionResult> InternationalConnote(string crId, string cId)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(crId);
            var item = lo.Source;
            var connote = new Consignment();
            foreach (var consignment in item.Consignments)
            {
                if (consignment.WebId == cId)
                {
                    connote = consignment;
                    break;
                }
            }
            UserProfile userProfile = await GetDesignation();
            var pcm = new printConnoteModel
            {
                referenceNo = item.ReferenceNo,
                consignment = connote,
                accountNo = item.CreatedBy,
                designation = userProfile.Designation,
            };
            return View(pcm);
        }

        [HttpGet]
        [Route("print-commercial-invoice/consignment-requests/{crId}/consignments/{cId}")]
        public async Task<ActionResult> CommercialInvoice(string crId, string cId)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(crId);
            var item = lo.Source;
            var connote = new Consignment();
            foreach (var consignment in item.Consignments)
            {
                if (consignment.WebId == cId)
                {
                    connote = consignment;
                    break;
                }
            }
            return View(connote);
        }

        [HttpGet]
        [Route("print-all-connote/consignment-requests/{crId}")]
        public async Task<ActionResult> AllConnote(string crId)
        {
            UserProfile userProfile = await GetDesignation();
            
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(crId);
            var item = lo.Source;

            if (userProfile.Designation == "Contract customer")
            {
                var itemsToRemove = new ConsigmentRequest();
                foreach (var temp in item.Consignments)
                {
                    if (temp.ConNote == null)
                    {
                        itemsToRemove.Consignments.Add(temp);
                    }
                }

                foreach (var itemRemove in itemsToRemove.Consignments)
                {
                    item.Consignments.Remove(itemRemove);
                }
            }
            
            return View(item);
        }

        private static async Task<LoadData<ConsigmentRequest>> GetConsigmentRequest(string id)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<ConsigmentRequest>>();
            var lo = await repos.LoadOneAsync(id);
            if (null == lo.Source)
                lo = await repos.LoadOneAsync("ReferenceNo", id);
            return lo;
        }

        private async Task<UserProfile> GetDesignation()
        {
            var username = User.Identity.Name;
            var directory = new SphDataContext();
            var userProfile = await directory.LoadOneAsync<UserProfile>(p => p.UserName == username) ?? new UserProfile();
            return userProfile;
        }
    }

    public class printConnoteModel
    {
        public string referenceNo { get; set; }
        public string accountNo { get; set; }
        public decimal amountPaid { get; set; }
        public string designation { get; set; }
        public Consignment consignment { get; set; }
    }

    public class UserTypeModel
    {
        public string Designation { get; set; }
    }
}