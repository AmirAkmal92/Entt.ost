using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Ost.Countries.Domain;
using Bespoke.Sph.Domain;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
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
                    consignment.Pemberi.Address.Postcode = int.Parse(Regex.Replace(consignment.Pemberi.Address.Postcode, @"\D", "")).ToString("D5");
                    consignment.Penerima.Address.Postcode = int.Parse(Regex.Replace(consignment.Penerima.Address.Postcode, @"\D", "")).ToString("D5");
                    connote = consignment;
                    break;
                }
            }
            UserProfile userProfile = await GetDesignation();
            var pcm = new printConnoteModel
            {
                referenceNo = item.ReferenceNo,
                consignment = connote,
                accountNo = item.UserId,
                amountPaid = item.Payment.TotalPrice,
                pickupDate = (item.Payment.IsPickupScheduled ? item.Pickup.DateReady : item.ChangedDate),
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
            connote.Pemberi.Address.Postcode = int.Parse(Regex.Replace(connote.Pemberi.Address.Postcode, @"\D", "")).ToString("D5");
            UserProfile userProfile = await GetDesignation();
            var pcm = new printConnoteModel
            {
                referenceNo = item.ReferenceNo,
                consignment = connote,
                accountNo = item.UserId,
                pickupDate = (item.Payment.IsPickupScheduled ? item.Pickup.DateReady : item.ChangedDate),
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

            var query = $@"{{
    ""filter"": {{
      ""query"": {{
         ""bool"": {{
            ""must"": [
                {{
                    ""term"": {{
                       ""Abbreviation"": ""{connote.Penerima.Address.Country}""
                    }}
                }}
            ]
         }}
      }}
   }}
}}";
            var repos = ObjectBuilder.GetObject<IReadonlyRepository<Country>>();
            var response = await repos.SearchAsync(query);
            var json = JObject.Parse(response).SelectToken("$.hits.hits");
            var searchedCountry = json.First.SelectToken("_source").ToObject<Country>();

            connote.Penerima.Address.Country = searchedCountry.Name;

            var printCommercialInvoiceModel = new printConnoteModel
            {
                referenceNo = item.ReferenceNo,
                consignment = connote,
                accountNo = item.UserId,
                amountPaid = item.Payment.TotalPrice,
                pickupDate = (item.Payment.IsPickupScheduled ? item.Pickup.DateReady : item.ChangedDate),
                designation = item.Designation,
                volMetricWeight = (connote.Produk.Width * connote.Produk.Length * connote.Produk.Height) / 6000,
            };
            return View(printCommercialInvoiceModel);
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
                    temp.Pemberi.Address.Postcode = int.Parse(Regex.Replace(temp.Pemberi.Address.Postcode, @"\D", "")).ToString("D5");
                    if (!temp.Produk.IsInternational)
                    {
                        temp.Penerima.Address.Postcode = int.Parse(Regex.Replace(temp.Penerima.Address.Postcode, @"\D", "")).ToString("D5");
                    }
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

        [HttpPut]
        [Route("print-lable-download/consignment-requests/{crId}/consignments/{cId}")]
        public async Task<ActionResult> LableDownload(string crId, string cId)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(crId);
            var item = lo.Source;
            var connote = new Consignment();
            foreach (var consignment in item.Consignments)
            {
                if (consignment.WebId == cId)
                {
                    consignment.Pemberi.Address.Postcode = int.Parse(Regex.Replace(consignment.Pemberi.Address.Postcode, @"\D", "")).ToString("D5");
                    if (!consignment.Produk.IsInternational)
                    {
                        consignment.Penerima.Address.Postcode = int.Parse(Regex.Replace(consignment.Penerima.Address.Postcode, @"\D", "")).ToString("D5");
                    }
                    consignment.Penerima.Address.Address1 = consignment.Penerima.Address.Address1.Substring(0, consignment.Penerima.Address.Address1.Length > 36 ? 36 : consignment.Penerima.Address.Address1.Length);
                    consignment.Penerima.Address.Address2 = consignment.Penerima.Address.Address2.Substring(0, consignment.Penerima.Address.Address2.Length > 36 ? 36 : consignment.Penerima.Address.Address2.Length);
                    if (!String.IsNullOrEmpty(consignment.Penerima.Address.Address3))
                        consignment.Penerima.Address.Address3 = consignment.Penerima.Address.Address3.Substring(0, consignment.Penerima.Address.Address3.Length > 30 ? 30 : consignment.Penerima.Address.Address3.Length);
                    if (!String.IsNullOrEmpty(consignment.Penerima.Address.Address4))
                        consignment.Penerima.Address.Address4 = consignment.Penerima.Address.Address4.Substring(0, consignment.Penerima.Address.Address4.Length > 30 ? 30 : consignment.Penerima.Address.Address4.Length);
                    connote = consignment;
                    break;
                }
            }
            string zplCode = GetLabelConnoteZplCode(item, connote);
            byte[] zpl = Encoding.UTF8.GetBytes(zplCode);
            var request = (HttpWebRequest)WebRequest.Create("http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/"); //TODO make it variable
            request.Method = "POST";
            request.Accept = "application/pdf";
            //request.Accept = "image/png"; //Get image output
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = zpl.Length;

            var requestStream = request.GetRequestStream();
            requestStream.Write(zpl, 0, zpl.Length);
            requestStream.Close();

            var path = Path.GetTempFileName() + ".pdf";
            var response = (HttpWebResponse)request.GetResponse();
            var responseStream = response.GetResponseStream();
            var fileStream = System.IO.File.Create(System.Web.HttpContext.Current.Server.MapPath($"~/Content/Files/Thermal_Label_{connote.ConNote}.pdf")); //Generate template file
            var fileTempStream = System.IO.File.Create(path); //Generate temporary file
            responseStream.CopyTo(fileStream);
            responseStream.Close();
            fileStream.Close();
            fileTempStream.Close();

            try
            {
                System.IO.File.Copy(fileStream.Name, fileTempStream.Name, true);
            }
            catch (Exception e)
            {
                return Json(new { success = false, status = e.Message });
            }
            return Json(new { success = true, status = "OK", path = Path.GetFileName(path) });
        }

        [HttpPut]
        [Route("print-all-lable-download/consignment-requests/{crId}/page/{page}")]
        public async Task<ActionResult> AllLableDownload(string crId, int page)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(crId);
            var item = lo.Source;
            var size = 50;
            var countConnote = (size * (page - 1));

            if (item.Designation == "Contract customer")
            {
                var itemsToRemove = new ConsigmentRequest();
                foreach (var temp in item.Consignments)
                {
                    temp.Pemberi.Address.Postcode = int.Parse(Regex.Replace(temp.Pemberi.Address.Postcode, @"\D", "")).ToString("D5");
                    if (!temp.Produk.IsInternational)
                    {
                        temp.Penerima.Address.Postcode = int.Parse(Regex.Replace(temp.Penerima.Address.Postcode, @"\D", "")).ToString("D5");
                    }
                    temp.Penerima.Address.Address1 = temp.Penerima.Address.Address1.Substring(0, temp.Penerima.Address.Address1.Length > 36 ? 36 : temp.Penerima.Address.Address1.Length);
                    temp.Penerima.Address.Address2 = temp.Penerima.Address.Address2.Substring(0, temp.Penerima.Address.Address2.Length > 36 ? 36 : temp.Penerima.Address.Address2.Length);
                    if (!String.IsNullOrEmpty(temp.Penerima.Address.Address3))
                        temp.Penerima.Address.Address3 = temp.Penerima.Address.Address3.Substring(0, temp.Penerima.Address.Address3.Length > 30 ? 30 : temp.Penerima.Address.Address3.Length);
                    if (!String.IsNullOrEmpty(temp.Penerima.Address.Address4))
                        temp.Penerima.Address.Address4 = temp.Penerima.Address.Address4.Substring(0, temp.Penerima.Address.Address4.Length > 30 ? 30 : temp.Penerima.Address.Address4.Length);
                    if (temp.ConNote == null || temp.Produk.IsInternational)
                    {
                        itemsToRemove.Consignments.Add(temp);
                    }
                }

                foreach (var itemRemove in itemsToRemove.Consignments)
                {
                    item.Consignments.Remove(itemRemove);
                }

                var zplCode = "";

                for (int i = countConnote; i < item.Consignments.Count && i < page * size; i++)
                {
                    zplCode += GetLabelConnoteZplCode(item, item.Consignments[i]);
                }

                byte[] zpl = Encoding.UTF8.GetBytes(zplCode);
                var request = (HttpWebRequest)WebRequest.Create("http://api.labelary.com/v1/printers/8dpmm/labels/4x6/"); //TODO make it variable
                request.Method = "POST";
                request.Accept = "application/pdf";
                //request.Accept = "image/png"; //Get image output
                request.ContentType = "application/x-www-form-urlencoded";
                request.ContentLength = zpl.Length;

                var requestStream = request.GetRequestStream();
                requestStream.Write(zpl, 0, zpl.Length);
                requestStream.Close();

                var path = Path.GetTempFileName() + ".pdf";
                var response = (HttpWebResponse)request.GetResponse();
                var responseStream = response.GetResponseStream();
                var fileStream = System.IO.File.Create(System.Web.HttpContext.Current.Server.MapPath($"~/Content/Files/Thermal_Label_{item.UserId}.pdf")); //Generate template file
                var fileTempStream = System.IO.File.Create(path); //Generate temporary file
                responseStream.CopyTo(fileStream);
                fileStream.Close();
                responseStream.Close();
                fileTempStream.Close();

                try
                {
                    System.IO.File.Copy(fileStream.Name, fileTempStream.Name, true);
                }
                catch (Exception e)
                {
                    return Json(new { success = false, status = e.Message });
                }
                return Json(new { success = true, status = "OK", path = Path.GetFileName(path) });
            }
            return Json(new { success = false, status = "Error" });
        }

        [HttpPut]
        [Route("print-lable/consignment-requests/{crId}/consignments/{cId}")]
        public async Task<ActionResult> Lable(string crId, string cId)
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

            string zplCode = GetLabelConnoteZplCode(item, connote);

            //Send direct to printer. Suitable for stand-alone EziSend offline. Not for online EziSend.
            //Set printer name here
            var PrinterName = "TSC TTP-247"; //TODO: prompt direct from web client to choose printer. kalau boleh lah.
            bool result = RawPrinterHelper.SendStringToPrinter(PrinterName, zplCode.ToString(), connote.ConNote);

            //Save as pdf for other purposes
            HttpWebRequest request = GetLableConnotePDF(zplCode);
            try
            {
                var response = (HttpWebResponse)request.GetResponse();
                var responseStream = response.GetResponseStream();
                var fileStream = System.IO.File.Create($@"C:\temp\Lable Connotes\{connote.ConNote}.pdf");
                responseStream.CopyTo(fileStream);
                responseStream.Close();
                fileStream.Close();
            }
            catch (WebException e)
            {
                //Console.WriteLine("Error: {0}", e.Status);
                return Json(new { success = false, status = "Fail", message = e.Status });
            }

            return Json(new { success = true, status = "OK" });
        }

        [HttpPut]
        [Route("print-all-lable/consignment-requests/{crId}")]
        public async Task<ActionResult> AllLable(string crId)
        {
            LoadData<ConsigmentRequest> lo = await GetConsigmentRequest(crId);
            var item = lo.Source;
            var countConnote = 1;

            if (item.Designation == "Contract customer")
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

                foreach (var itemHasConnote in item.Consignments)
                {
                    string zplCode = GetLabelConnoteZplCode(item, itemHasConnote);

                    //Send direct to printer. Suitable for stand-alone EziSend offline. Not for online EziSend.
                    //Set printer name here
                    var PrinterName = "TSC TTP-247"; //TODO: prompt direct from web client to choose printer kalau boleh lah
                    bool result = RawPrinterHelper.SendStringToPrinter(PrinterName, zplCode.ToString(), $"{countConnote} - {itemHasConnote.ConNote}");

                    //Save as pdf for other purposes
                    HttpWebRequest request = GetLableConnotePDF(zplCode);
                    try
                    {
                        var response = (HttpWebResponse)request.GetResponse();
                        var responseStream = response.GetResponseStream();
                        var fileStream = System.IO.File.Create($@"C:\temp\Lable Connotes\{countConnote} - {itemHasConnote.ConNote}.pdf");
                        responseStream.CopyTo(fileStream);
                        responseStream.Close();
                        fileStream.Close();
                    }
                    catch (WebException e)
                    {
                        //Console.WriteLine("Error: {0}", e.Status);
                        return Json(new { success = false, status = "Fail", message = e.Status });
                    }
                    countConnote++;
                }
            }

            return Json(new { success = true, status = "OK" });
        }

        private static HttpWebRequest GetLableConnotePDF(string zplCode)
        {
            byte[] zpl = Encoding.UTF8.GetBytes(zplCode);
            var request = (HttpWebRequest)WebRequest.Create("http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/");
            request.Method = "POST";
            request.Accept = "application/pdf";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = zpl.Length;

            var requestStream = request.GetRequestStream();
            requestStream.Write(zpl, 0, zpl.Length);
            requestStream.Close();
            return request;
        }

        private static string GetLabelConnoteZplCode(ConsigmentRequest item, Consignment itemHasConnote)
        {
            DataMatrixModel dataMatrixModel = GetDataMatrix2DBarCodeModel(item, itemHasConnote);

            var dataMatrixCodeThermal = $"{dataMatrixModel.versionHeader}_5e{dataMatrixModel.connoteNum}_5e{dataMatrixModel.recipientPostcode}_5e{dataMatrixModel.countryCode}_5e{dataMatrixModel.productCode}_5e{dataMatrixModel.parentConnote}_5e{dataMatrixModel.mpsIndicator}_5e" +
                                 $"{dataMatrixModel.senderPhoneNum}_5e{dataMatrixModel.senderEmail}_5e{dataMatrixModel.senderRefNo}_5e{dataMatrixModel.customerAccNum}_5e{dataMatrixModel.recipientPhoneNum}_5e{dataMatrixModel.recipientEmail}_5e{dataMatrixModel.weight}_5e{dataMatrixModel.dimensionVol}_5e" +
                                 $"{dataMatrixModel.codAmount}_5e{dataMatrixModel.ccodAmount}_5e{dataMatrixModel.valueAdded}_5e{dataMatrixModel.itemCategory}_5e{dataMatrixModel.amountPaid}_5e{dataMatrixModel.zone}";

            var pemberiAddressLine2 = (!String.IsNullOrEmpty(itemHasConnote.Pemberi.Address.Address4) ? itemHasConnote.Pemberi.Address.Address3 + ", " + itemHasConnote.Pemberi.Address.Address4 : itemHasConnote.Pemberi.Address.Address3);
            var penerimaAddressLine2 = (!String.IsNullOrEmpty(itemHasConnote.Penerima.Address.Address4) ? itemHasConnote.Penerima.Address.Address3 + ", " + itemHasConnote.Penerima.Address.Address4 : itemHasConnote.Penerima.Address.Address3);
            var internationalDescription = (!String.IsNullOrEmpty(itemHasConnote.Produk.CustomDeclaration.ContentDescription2) ? itemHasConnote.Produk.CustomDeclaration.ContentDescription1 + " " + itemHasConnote.Produk.CustomDeclaration.ContentDescription2 + " " + itemHasConnote.Produk.CustomDeclaration.ContentDescription3 : itemHasConnote.Produk.CustomDeclaration.ContentDescription1);
            var connoteDate = (item.Payment.IsPickupScheduled ? item.Pickup.DateReady : item.ChangedDate);
            var volumetricWeight = (itemHasConnote.Produk.Width * itemHasConnote.Produk.Length * itemHasConnote.Produk.Height) / 6000;
            var itemCategory = (itemHasConnote.Produk.ItemCategory == "01" ? "DOCUMENT" : "MERCHANDISE");
            var productType = (itemHasConnote.Produk.IsInternational ? "INTERNATIONAL" : "DOMESTIC");
            var chargeOnDelivery = itemHasConnote.Produk.Est.CodAmount > 0 ? ("COD : RM " + itemHasConnote.Produk.Est.CodAmount.ToString("0.00")) : ("CCOD : RM " + itemHasConnote.Produk.Est.CcodAmount.ToString("0.00"));
            var textChargeOnDeliveryCustCopy = (itemHasConnote.Produk.Est.CodAmount > 0 || itemHasConnote.Produk.Est.CcodAmount > 0 ? "JUMLAH " + chargeOnDelivery : "");
            var textChargeOnDeliveryPPLCopy = (itemHasConnote.Produk.Est.CodAmount > 0 || itemHasConnote.Produk.Est.CcodAmount > 0 ? chargeOnDelivery : "");
            var routingCode = itemHasConnote.Produk.IsInternational ? "" : itemHasConnote.Bill.RoutingCode;

            var zplCode = "^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR5,5~SD15^JUS^LRN^CI0^XZ";
            zplCode += "^XA";
            zplCode += "^MMT";
            zplCode += "^PW812";
            zplCode += "^LL1242";
            zplCode += "^LS0";
            zplCode += "^FT27,644^AQ^FH^FDKEPADA :^FS";
            zplCode += "^FT27,672^AQ^FH^FD" + itemHasConnote.Penerima.ContactPerson.ToUpper() + "^FS";
            zplCode += "^FT27,700^AQ^FH^FD" + itemHasConnote.Penerima.Address.Address1.ToUpper() + "^FS";
            zplCode += "^FS^FT27,728^AQ^FH^FD" + itemHasConnote.Penerima.Address.Address2.ToUpper() + "^FS";
            zplCode += "^FS^FT27,756^AQ^FH^FD" + (!String.IsNullOrEmpty(itemHasConnote.Penerima.Address.Address3) ? itemHasConnote.Penerima.Address.Address3.ToUpper() : "") + "^FS";
            zplCode += "^FS^FT27,784^AQ^FH^FD" + (!String.IsNullOrEmpty(itemHasConnote.Penerima.Address.Address4) ? itemHasConnote.Penerima.Address.Address4.ToUpper() : "") + "^FS";
            zplCode += "^FS^FT27,812^AQ^FH^FD" + itemHasConnote.Penerima.Address.City.ToUpper() + "^FS";
            zplCode += "^FT27,840^AQ^FH^FD" + itemHasConnote.Penerima.Address.State.ToUpper() + "^FS";
            zplCode += "^FT27,868^AQ^FH^FD" + itemHasConnote.Penerima.Address.Postcode + "^FS";
            zplCode += "^FO5,617^GB806,0,1^FS";
            zplCode += "^FO5,923^GB806,0,1^FS";
            zplCode += "^FO7,401^GB794,0,1^FS";
            zplCode += "^FT382,648^AQ^FH^FDRUJ. PENERIMA : " + (!String.IsNullOrEmpty(itemHasConnote.Produk.Est.ReceiverReferenceNo) ? itemHasConnote.Produk.Est.ReceiverReferenceNo.ToUpper() : "") + "^FS";
            zplCode += "^FT558,432^AQ^FH^FD" + item.UserId + "^FS";
            zplCode += "^FT540,986^AU,48,124^FH^FD" + itemHasConnote.Penerima.Address.Postcode + "^FS";
            zplCode += "^FT28,901^AQ^FH^FDTEL : " + itemHasConnote.Penerima.ContactInformation.ContactNumber + "^FS";
            zplCode += "^FT26,954^AQ^FH^FDPOSKOD : ^FS";
            zplCode += "^FT254,901^AQ^FH^FDTEL2 : " + itemHasConnote.Penerima.ContactInformation.AlternativeContactNumber + "^FS";
            zplCode += "^BY2,3,74^FT475,1191^BCN,,Y,N";
            zplCode += "^FD" + itemHasConnote.ConNote.ToUpper() + "^FS";
            zplCode += "^BY2,3,110^FT423,148^BCN,,Y,N";
            zplCode += "^FD" + itemHasConnote.ConNote.ToUpper() + "^FS";
            zplCode += "^FT28,429^AQ^FH^FDDARIPADA :^FS";
            zplCode += "^FT27,208^AQ^FH^FDMAKLUMAT ITEM^FS";
            zplCode += "^FT325,307^AP^FH^FD" + (itemHasConnote.Produk.ValueAddedDeclaredValue != 0 ? "Insurance :      YES" : "") + "^FS^FT500,307^AP^FH^FD" + (itemHasConnote.Produk.ValueAddedDeclaredValue != 0 ? ("Value : RM " + itemHasConnote.Produk.ValueAddedDeclaredValue) : "") + "^FS";
            zplCode += "^FT325,284^AP^FH^FDKeterangan :^FS";
            zplCode += "^FT325,261^AP^FH^FDJenis :^FS";
            zplCode += "^FT421,284^AP^FH^FD" + (itemHasConnote.Produk.IsInternational ? internationalDescription : itemHasConnote.Produk.Description).ToUpper() + "^FS";
            zplCode += "^FT325,238^AP^FH^FDProduk :^FS";
            zplCode += "^FT421,261^AP^FH^FD" + itemCategory + "^FS";
            zplCode += "^FT325,211^AQ^FH^FDRUJ. TRANSAKSI : " + item.ReferenceNo.ToUpper() + "^FS";
            zplCode += "^FT421,236^AP^FH^FDCOURIER CHARGES - " + productType + "^FS";
            zplCode += "^FT27,297^AP^FH^FDVolumetrik :^FS";
            zplCode += "^FT123,297^AP^FH^FD" + volumetricWeight.ToString("0.00") + "KG^FS";
            zplCode += "^FT27,277^AP^FH^FDSebenar :^FS";
            zplCode += "^FT124,279^AP^FH^FD" + itemHasConnote.Bill.ActualWeight.ToString("0.00") + " KG^FS";
            zplCode += "^FT28,259^AP^FH^FDBerat :^FS";
            zplCode += "^FT123,261^AP^FH^FD" + itemHasConnote.Produk.Weight.ToString("0.00") + " KG^FS";
            zplCode += "^FT402,431^AQ^FH^FDAKAUN NO :^FS";
            zplCode += "^FT250,605^AP^FH^FDTEL2 : " + itemHasConnote.Pemberi.ContactInformation.AlternativeContactNumber + "^FS";
            zplCode += "^FT500,605^AP^FH^FDRUJ. PENGIRIM : " + (!String.IsNullOrEmpty(itemHasConnote.Produk.Est.ShipperReferenceNo) ? itemHasConnote.Produk.Est.ShipperReferenceNo.ToUpper() : "") + "^FS";
            zplCode += "^FT25,605^AP^FH^FDTEL : " + itemHasConnote.Pemberi.ContactInformation.ContactNumber + "^FS";
            zplCode += "^FT29,458^AP^FH^FD" + (!String.IsNullOrEmpty(itemHasConnote.Pemberi.CompanyName) ? itemHasConnote.Pemberi.CompanyName.ToUpper() : "") + "^FS";
            zplCode += "^FT29,479^AP^FH^FD" + (itemHasConnote.Pemberi.Address.Address1 + ", " + itemHasConnote.Pemberi.Address.Address2).ToUpper() + "^FS";
            zplCode += "^FT29,500^AP^FH^FD" + (!String.IsNullOrEmpty(pemberiAddressLine2) ? pemberiAddressLine2.ToUpper() : "") + "^FS";
            zplCode += "^FT29,521^AP^FH^FD" + itemHasConnote.Pemberi.Address.City.ToUpper() + "^FS";
            zplCode += "^FT29,542^AP^FH^FD" + itemHasConnote.Pemberi.Address.State.ToUpper() + "^FS";
            zplCode += "^FT29,563^AP^FH^FD" + itemHasConnote.Pemberi.Address.Postcode + "^FS";
            zplCode += "^FT31,1043^AP^FH^FDKepada:^FS";
            zplCode += "^FT31,1064^AP^FH^FD" + (!String.IsNullOrEmpty(itemHasConnote.Penerima.CompanyName) ? itemHasConnote.Penerima.CompanyName.ToUpper() : "") + "^FS";
            zplCode += "^FT31,1085^AP^FH^FD" + (itemHasConnote.Penerima.Address.Address1 + ", " + itemHasConnote.Penerima.Address.Address2).ToUpper() + "^FS";
            zplCode += "^FT31,1106^AP^FH^FD" + (!String.IsNullOrEmpty(penerimaAddressLine2) ? penerimaAddressLine2.ToUpper() : "") + "^FS";
            zplCode += "^FT31,1127^AP^FH^FD" + itemHasConnote.Penerima.Address.City.ToUpper() + "^FS";
            zplCode += "^FT31,1148^AP^FH^FD" + itemHasConnote.Penerima.Address.State.ToUpper() + "^FS";
            zplCode += "^FT31,1169^AP^FH^FD" + itemHasConnote.Penerima.Address.Postcode + "^FS";
            zplCode += "^FT309,1169^AP^FH^FD" + (itemHasConnote.Produk.ValueAddedDeclaredValue != 0 ? ("Value : RM " + itemHasConnote.Produk.ValueAddedDeclaredValue) : "") + "^FS^FT168,1169^AP^FH^FD" + (itemHasConnote.Produk.ValueAddedDeclaredValue != 0 ? "Insurance : YES" : "") + "^FS";
            zplCode += "^FT309,1191^AP^FH^FD" + textChargeOnDeliveryPPLCopy + "^FS";
            zplCode += "^FT168,1191^AP^FH^FDTel2 : " + itemHasConnote.Penerima.ContactInformation.AlternativeContactNumber + "^FS";
            zplCode += "^FT33,1191^AP^FH^FDTel : " + itemHasConnote.Penerima.ContactInformation.ContactNumber + "^FS";
            zplCode += "^FT27,240^AP^FH^FDTarikh :^FS";
            zplCode += "^FT121,240^AP^FH^FD" + connoteDate.ToString("d MMMM yyyy") + "^FS";
            zplCode += "^FT180,378^AV^FH^FD" + routingCode + "^FS";
            zplCode += "^FS^FT434,1194^AT^FH^FT392,571^AT^FH^FD" + textChargeOnDeliveryPPLCopy + "^FS";
            zplCode += "^FT262,1040^AQ^FH^FDSalinan Pejabat^FS";
            zplCode += "^FS^FT150,1000^AT^FH^FD*" + itemHasConnote.ConNote.ToUpper() + "*^FS";
            zplCode += "^BY128,128^FT620,920^BXN,4,200,0,0,1,~";
            zplCode += "^FH^FD" + dataMatrixCodeThermal + "^FS";
            zplCode += "^PQ1,0,1,Y^XZ";
            return zplCode;
        }

        private static DataMatrixModel GetDataMatrix2DBarCodeModel(ConsigmentRequest item, Consignment itemHasConnote)
        {
            var dataMatrixModel = new DataMatrixModel
            {
                versionHeader = "A1",                                                                                               //01
                connoteNum = itemHasConnote.ConNote,                                                                                //02
                recipientPostcode = itemHasConnote.Penerima.Address.Postcode,                                                       //03
                countryCode = itemHasConnote.Penerima.Address.Country,                                                              //04
                productCode = (itemHasConnote.Produk.IsInternational) ? "80000001" : "80000000",                                    //05
                parentConnote = (itemHasConnote.IsMps) ? itemHasConnote.ConNote : "",                                               //06
                mpsIndicator = (itemHasConnote.IsMps) ? "02" : "01",                                                                //07
                senderPhoneNum = itemHasConnote.Pemberi.ContactInformation.ContactNumber,                                           //08
                senderEmail = itemHasConnote.Pemberi.ContactInformation.Email,                                                      //09
                senderRefNo = item.ReferenceNo,                                                                                     //10
                customerAccNum = (item.Designation == "Contract customer") ? item.UserId : "",                                      //11
                recipientPhoneNum = itemHasConnote.Penerima.ContactInformation.ContactNumber,                                       //12
                recipientEmail = itemHasConnote.Penerima.ContactInformation.Email,                                                  //13
                weight = itemHasConnote.Produk.Weight.ToString("0.00"),                                                             //14
                dimensionVol = $"{itemHasConnote.Produk.Length.ToString("0")}" +                                                    //15
                                                                       $"x{itemHasConnote.Produk.Width.ToString("0")}" +
                                                                       $"x{itemHasConnote.Produk.Height.ToString("0")}",
                codAmount = itemHasConnote.Produk.Est.CodAmount > 0 ? itemHasConnote.Produk.Est.CodAmount.ToString("0.00") : "",    //16
                ccodAmount = itemHasConnote.Produk.Est.CcodAmount > 0 ? itemHasConnote.Produk.Est.CcodAmount.ToString("0.00") : "", //17
                valueAdded = itemHasConnote.Produk.ValueAddedValue.ToString("0"),                                                   //18
                itemCategory = itemHasConnote.Produk.ItemCategory,                                                                  //19
                amountPaid = item.Payment.TotalPrice.ToString("0"),                                                                 //20
                zone = (itemHasConnote.Produk.IsInternational) ? "" : "02",                                                         //21
            };
            return dataMatrixModel;
        }

        public class RawPrinterHelper
        {
            [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
            public class DOCINFOA
            {
                [MarshalAs(UnmanagedType.LPStr)]
                public string pDocName;
                [MarshalAs(UnmanagedType.LPStr)]
                public string pOutputFile;
                [MarshalAs(UnmanagedType.LPStr)]
                public string pDataType;
            }
            [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

            [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool ClosePrinter(IntPtr hPrinter);

            [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

            [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool EndDocPrinter(IntPtr hPrinter);

            [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool StartPagePrinter(IntPtr hPrinter);

            [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool EndPagePrinter(IntPtr hPrinter);

            [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);

            // SendBytesToPrinter()
            // When the function is given a printer name and an unmanaged array
            // of bytes, the function sends those bytes to the print queue.
            // Returns true on success, false on failure.
            public static bool SendBytesToPrinter(string szPrinterName, IntPtr pBytes, Int32 dwCount, string pFileName)
            {
                Int32 dwError = 0, dwWritten = 0;
                IntPtr hPrinter = new IntPtr(0);
                DOCINFOA di = new DOCINFOA();
                bool bSuccess = true; // Assume failure unless you specifically succeed.

                di.pDocName = pFileName;
                di.pDataType = "RAW";

                // Open the printer.
                if (OpenPrinter(szPrinterName, out hPrinter, IntPtr.Zero))
                {
                    // Start a document.
                    if (StartDocPrinter(hPrinter, 1, di))
                    {
                        // Start a page.
                        if (StartPagePrinter(hPrinter))
                        {
                            // Write the bytes.
                            bSuccess = WritePrinter(hPrinter, pBytes, dwCount, out dwWritten);
                            EndPagePrinter(hPrinter);
                        }
                        EndDocPrinter(hPrinter);
                    }
                    ClosePrinter(hPrinter);
                }
                // If you did not succeed, GetLastError may give more information
                // about why not.
                if (bSuccess == false)
                {
                    dwError = Marshal.GetLastWin32Error();
                }
                return bSuccess;
            }

            public static bool SendStringToPrinter(string szPrinterName, string pDoc, string pFileName)
            {
                MemoryStream stream = new MemoryStream(Encoding.UTF8.GetBytes(pDoc));
                byte[] rawData = new byte[stream.Length];
                stream.Read(rawData, 0, (int)stream.Length);
                GCHandle rawDataHandle = GCHandle.Alloc(rawData, GCHandleType.Pinned);
                IntPtr pointer = rawDataHandle.AddrOfPinnedObject();
                return SendBytesToPrinter(szPrinterName, pointer, rawData.Length, pFileName);
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
        public DateTime pickupDate { get; set; }
        public string designation { get; set; }
        public Consignment consignment { get; set; }
        public decimal volMetricWeight { get; set; }
    }

    public class UserTypeModel
    {
        public string Designation { get; set; }
    }

    public class DataMatrixModel
    {
        public string versionHeader { get; set; }
        public string connoteNum { get; set; }
        public string recipientPostcode { get; set; }
        public string countryCode { get; set; }
        public string productCode { get; set; }
        public string parentConnote { get; set; }
        public string mpsIndicator { get; set; }
        public string senderPhoneNum { get; set; }
        public string senderEmail { get; set; }
        public string senderRefNo { get; set; }
        public string customerAccNum { get; set; }
        public string recipientPhoneNum { get; set; }
        public string recipientEmail { get; set; }
        public string weight { get; set; }
        public string dimensionVol { get; set; }
        public string codAmount { get; set; }
        public string ccodAmount { get; set; }
        public string valueAdded { get; set; }
        public string itemCategory { get; set; }
        public string amountPaid { get; set; }
        public string zone { get; set; }
    }
}