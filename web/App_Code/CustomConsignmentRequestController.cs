using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Ost.PosLajuBranchBranches.Domain;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace web.sph.App_Code
{
    [RoutePrefix("consignment-request")]
    public class CustomConsignmentRequestController : BaseApiController
    {
        [HttpPut]
        [Route("calculate-total-price/{id}")]
        public async Task<IHttpActionResult> CalculateAndSaveTotalPrice(string id)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var item = lo.Source;
            decimal total = 0;

            foreach (var consignment in lo.Source.Consignments)
            {
                total += consignment.Produk.Price;
            }
            item.Payment.TotalPrice = total;
            await SaveConsigmentRequest(item);

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
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var pxReq = new PxRexModel();
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

        [HttpPut]
        [Route("generate-and-save-con-notes/{id}")]
        public async Task<IHttpActionResult> GenerateAndSaveConNotes(string id)
        {
            //TODO: Set & Get from appSettings 
            var baseUrl = "http://stagingsds.pos.com.my/apigateway/as2corporate/api/generateconnote/v1";
            var secretKey = "ODA2MzViZTAtODk3MS00OGU5LWFiNGEtYTcxYjAxMjU4NjM1";

            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(id);
            if (null == lo.Source) return NotFound("Cannot find ConsigmentRequest with Id/ReferenceNo:" + id);

            var resultSuccess = true;
            var resultStatus = "OK";
            var item = lo.Source;

            var totalConsignments = item.Consignments.Count;
            if (totalConsignments > 0)
            {
                if (!item.Payment.IsConNoteReady)
                {
                    var client = new HttpClient();
                    client.DefaultRequestHeaders.Add("x-user-key", secretKey);

                    List<KeyValuePair<string, string>> pairs = new List<KeyValuePair<string, string>>();
                    //TODO: need more information from API provider; hardcode for now
                    pairs.Add(new KeyValuePair<string, string>("Prefix", "ES"));
                    pairs.Add(new KeyValuePair<string, string>("ApplicationCode", "OST"));
                    pairs.Add(new KeyValuePair<string, string>("Secretid", "ost@1234"));
                    pairs.Add(new KeyValuePair<string, string>("username", "entt.ost"));
                    pairs.Add(new KeyValuePair<string, string>("numberOfItem", totalConsignments.ToString()));
                    pairs.Add(new KeyValuePair<string, string>("Orderid", item.Id));

                    var content = new FormUrlEncodedContent(pairs);
                    var query = content.ReadAsStringAsync().Result;
                    var output = await client.GetStringAsync(baseUrl + "?" + query);
                    //TODO: check output for error and null
                    var json = JObject.Parse(output);
                    //TODO: check json for error and null

                    if (json["StatusCode"].ToString() == "01")
                    {
                        var conNotes = json["ConnoteNo"].ToString().Split('|');
                        if (conNotes.Length >= item.Consignments.Count)
                        {
                            var count = 0;
                            foreach (var conNote in conNotes)
                            {
                                item.Consignments[count].ConNote = conNote;
                                count++;
                            }
                            item.Payment.IsConNoteReady = true;
                            await SaveConsigmentRequest(item);
                        }
                        else
                        {
                            resultSuccess = false;
                            resultStatus = "Generated consignment note not enough";
                        }
                    }
                    else
                    {
                        resultSuccess = false;
                        resultStatus = "StatusCode: " + json["StatusCode"].ToString() + " Message: " + json["Message"].ToString();
                    }
                }
                else
                {
                    resultSuccess = false;
                    resultStatus = "Consignment note was already generated";
                }
            }
            else
            {
                resultSuccess = false;
                resultStatus = "Consignment not found";
            }

            var result = new
            {
                success = resultSuccess,
                status = resultStatus,
                id = item.Id,
            };

            // wait until the worker process it
            await Task.Delay(1500);
            return Accepted(result);
        }

        [HttpGet]
        [Route("get-pickup-availability/{postcode}")]
        public async Task<IHttpActionResult> GetPickupAvailability(int postcode)
        {
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<PosLajuBranch>>();
            var query = $@"{{
  ""filter"": {{
    ""bool"": {{
      ""must"": [

      ],
      ""must_not"": [

      ]
    }}
  }},
  ""sort"": [ {{ ""PostcodeFrom"": {{ ""order"": ""asc"" }} }} ],
  ""aggs"": {{
    ""filtered_max_date"": {{
      ""filter"": {{
        ""bool"": {{
          ""must"": [

          ],
          ""must_not"": [

          ]
        }}
      }},
      ""aggs"": {{
        ""last_changed_date"": {{
          ""max"": {{
            ""field"": ""ChangedDate""
          }}
        }}
      }}
    }}
  }}
}}";
            var queryString = "from=0&size=200";
            var response = await repos.SearchAsync(query, queryString);
            var json = JObject.Parse(response);

            var list = from f in json.SelectToken("$.hits.hits")
                       let webId = f.SelectToken("_source.WebId").Value<string>()
                       let id = f.SelectToken("_id").Value<string>()
                       let link = $"\"link\" :{{ \"href\" :\"{ConfigurationManager.BaseUrl}/api/pos-laju-branches/{id}\"}}"
                       select f.SelectToken("_source").ToString().Replace($"{webId}\"", $"{webId}\"," + link);

            var posLajuBranches = list.ToList();
            List<PosLajuBranch> branches = new List<PosLajuBranch>();

            foreach (var posLajuBranch in posLajuBranches)
            {
                JObject jObject = JObject.Parse(posLajuBranch);
                var tmpBranch = new PosLajuBranch
                {
                    BranchCode = (string)jObject["BranchCode"],
                    Name = (string)jObject["Name"],
                    PostcodeFrom = (string)jObject["PostcodeFrom"],
                    PostcodeTo = (string)jObject["PostcodeTo"],
                    Email = (string)jObject["Email"],
                    PickupId = (string)jObject["PickupId"],
                    CreatedBy = (string)jObject["CreatedBy"],
                    Id = (string)jObject["Id"],
                    CreatedDate = (DateTime)jObject["CreatedDate"],
                    ChangedBy = (string)jObject["ChangedBy"],
                    ChangedDate = (DateTime)jObject["ChangedDate"],
                    WebId = (string)jObject["WebId"]
                };

                branches.Add(tmpBranch);
            }

            var branch = branches.Where(x => postcode >= Int32.Parse(x.PostcodeFrom) && postcode <= Int32.Parse(x.PostcodeTo)).FirstOrDefault();

            if (branch == null)
            {
                return NotFound("No pickup for postcode: " + postcode);
            }

            return Ok(branch);
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
}