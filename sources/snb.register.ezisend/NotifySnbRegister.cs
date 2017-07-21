using Bespoke.Ost.EstRegistrations.Domain;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Bespoke.PosEntt.CustomActions
{

    public class NotifySnbRegister
    {
        private string m_snbClientApi;

        public NotifySnbRegister()
        {
            m_snbClientApi = ConfigurationManager.GetEnvironmentVariable("SnbWebApi") ?? "http://10.1.1.119:9002";
        }

        public async Task SendNotifyEmail(string emailTo, string emailSubject, string emailMessage, string userid)
        {
            var emailBody = $@"Hello,

            {emailMessage}.
            Your details has been successfully submitted with user id {userid}.";

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
        public async Task RegisterNewContractCustomer(EstRegistration item)
        {
            await Task.Delay(100);
            Console.WriteLine($"======================");
            Console.WriteLine($"Contact Id: {item.Id}");
            Console.WriteLine($"Contact User Id: {item.UserId}");
            Console.WriteLine($"Contact Person Name: {item.PersonalDetail.ContactPersonName}");
            Console.WriteLine($"Contact Person Ic: {item.PersonalDetail.ContactPersonIc}");
            Console.WriteLine($"Supporting Document (FormP13AndTnc): {item.FormP13AndTnc.BinaryStoreId}");
            var count = 0;
            foreach (var dirInfo in item.DirectorInformation)
            {
                count++;
                Console.WriteLine($"Director {count} Name: {dirInfo.DirectorName}");
                Console.WriteLine($"Director {count} Ic: {dirInfo.DirectorIcNumber}");
            }
            Console.WriteLine($"======================");

            var Profile = new Profile
            {
                UserId = item.UserId,
                Id = item.Id.ToString(),
                //SbuName = item.SbuName, : TBD
                SbuName = "OST",
                //RefNo = item.RefNo, : TBD
                RefNo = null,
                Documents = new List<Document> { }, // TODO MAP DOC 1 to 1
                PersonalDetail = new PersonDetail
                {
                    MailingAddress = new MailAddress
                    {
                        Address1 = item.PersonalDetail.MailingAddress.Address1,
                        Address2 = item.PersonalDetail.MailingAddress.Address2,
                        Address3 = item.PersonalDetail.MailingAddress.Address3,
                        Address4 = item.PersonalDetail.MailingAddress.Address4,
                        City = item.PersonalDetail.MailingAddress.City,
                        State = "PAH",
                        Country = "MY",
                        Postcode = item.PersonalDetail.MailingAddress.Postcode,
                        GeoLocation = new GeoLocation
                        {
                            Lat = item.PersonalDetail.MailingAddress.GeoLocation.Lat,
                            Long = item.PersonalDetail.MailingAddress.GeoLocation.Long
                        }
                    },
                    BillingAddress = new BillAddress
                    {
                        Address1 = item.PersonalDetail.BillingAddress.Address1,
                        Address2 = item.PersonalDetail.BillingAddress.Address2,
                        Address3 = item.PersonalDetail.BillingAddress.Address3,
                        Address4 = item.PersonalDetail.BillingAddress.Address4,
                        City = item.PersonalDetail.BillingAddress.City,
                        State = "PAH",
                        Country = "MY",
                        Postcode = item.PersonalDetail.BillingAddress.Postcode,
                        GeoLocation = new GeoLocation
                        {
                            Lat = item.PersonalDetail.BillingAddress.GeoLocation.Lat,
                            Long = item.PersonalDetail.BillingAddress.GeoLocation.Long
                        }
                    },
                    PickupAddress = new PickAddress
                    {
                        Address1 = item.PersonalDetail.PickupAddress.Address1,
                        Address2 = item.PersonalDetail.PickupAddress.Address2,
                        Address3 = item.PersonalDetail.PickupAddress.Address3,
                        Address4 = item.PersonalDetail.PickupAddress.Address4,
                        City = item.PersonalDetail.PickupAddress.City,
                        State = "PAH",
                        Country = "MY",
                        Postcode = item.PersonalDetail.PickupAddress.Postcode,
                        GeoLocation = new GeoLocation
                        {
                            Lat = item.PersonalDetail.PickupAddress.GeoLocation.Lat,
                            Long = item.PersonalDetail.PickupAddress.GeoLocation.Long
                        }
                    },
                    ContactInformation = new ContactInfo
                    {
                        Email = item.PersonalDetail.ContactInformation.Email,
                        ContactNumber = item.PersonalDetail.ContactInformation.ContactNumber,
                        AlternativeContactNumber = item.PersonalDetail.ContactInformation.AlternativeContactNumber
                    },
                    ContactPersonIc = item.PersonalDetail.ContactPersonIc,
                    ContactPersonName = item.PersonalDetail.ContactPersonName

                },
                CompanyInformation = new CompanyInfo
                {
                    CompanyName = item.CompanyInformation.CompanyName,
                    CompanyType = item.CompanyInformation.CompanyType,
                    GstId = item.CompanyInformation.GstId,
                    Industry = "C07",
                    TypePosting = item.CompanyInformation.TypePosting,
                    IsPosLajuAgent = item.CompanyInformation.IsPosLajuAgent,
                    RocNumber = item.CompanyInformation.RocNumber,
                    //CurrencyCode = item.CompanyInformation.CurrencyCode, : TBD
                    CurrencyCode = "MYR",
                },
                DirectorInformation = new List<DirectorInformation> { }, //TODO Count
            };
            var client = new RestClient($"{m_snbClientApi}/api/create-cust");
            var request = new RestRequest(Method.POST);
            var postManGuid = Guid.NewGuid().ToString();
            var json = request.JsonSerializer.Serialize(Profile);
            request.AddHeader("postman-token", postManGuid);
            request.AddHeader("cache-control", "no-cache");
            request.AddHeader("content-type", "application/json");
            request.AddParameter("application/json", json, ParameterType.RequestBody);
            IRestResponse response = client.Execute(request);
            if (response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.Created
                || response.StatusCode == HttpStatusCode.Accepted)
            {
                var jsonOutput = JObject.Parse(response.Content).SelectToken("refno");
                Console.WriteLine($"Reference Number: {jsonOutput}");
            }
            else
            {
                var jsonOutput = JObject.Parse(response.Content).SelectToken("Message");
                Console.WriteLine($"Error Message: {jsonOutput}");
            }
        }
        public class Profile
        {
            public string UserId { get; set; }
            public string Id { get; set; }
            public string SbuName { get; set; }
            public string RefNo { get; set; }
            public CompanyInfo CompanyInformation { get; set; }
            public List<Document> Documents { get; set; }
            public List<DirectorInformation> DirectorInformation { get; set; }
            public PersonDetail PersonalDetail { get; set; }
        }
        public class PersonDetail
        {
            public string ContactPersonName { get; set; }
            public string ContactPersonIc { get; set; }
            public ContactInfo ContactInformation { get; set; }
            public MailAddress MailingAddress { get; set; }
            public BillAddress BillingAddress { get; set; }
            public PickAddress PickupAddress { get; set; }
        }
        public class Document
        {
            public string Id { get; set; }
            public string DocTypeId { get; set; }
            public string DocType { get; set; }
        }
        public class DirectorInformation
        {
            public string DirectorName { get; set; }
            public string DirectorIcNumber { get; set; }
            public string DirectorUserId { get; set; }
        }
        public class CompanyInfo
        {
            public string CompanyName { get; set; }
            public string CompanyType { get; set; }
            public string Industry { get; set; }
            public string GstId { get; set; }
            public string TypePosting { get; set; }
            public bool IsPosLajuAgent { get; set; }
            public string RocNumber { get; set; }
            public string CurrencyCode { get; set; }
        }
        public class ContactInfo
        {
            public string Email { get; set; }
            public string ContactNumber { get; set; }
            public string AlternativeContactNumber { get; set; }
        }
        public class MailAddress
        {
            public string Address1 { get; set; }
            public string Address2 { get; set; }
            public string Address3 { get; set; }
            public string Address4 { get; set; }
            public string City { get; set; }
            public string State { get; set; }
            public string Country { get; set; }
            public string Postcode { get; set; }
            public GeoLocation GeoLocation { get; set; }
        }
        public class BillAddress
        {
            public string Address1 { get; set; }
            public string Address2 { get; set; }
            public string Address3 { get; set; }
            public string Address4 { get; set; }
            public string City { get; set; }
            public string State { get; set; }
            public string Country { get; set; }
            public string Postcode { get; set; }
            public GeoLocation GeoLocation { get; set; }
        }
        public class PickAddress
        {
            public string Address1 { get; set; }
            public string Address2 { get; set; }
            public string Address3 { get; set; }
            public string Address4 { get; set; }
            public string City { get; set; }
            public string State { get; set; }
            public string Country { get; set; }
            public string Postcode { get; set; }
            public GeoLocation GeoLocation { get; set; }
        }
        public class GeoLocation
        {
            public decimal Lat { get; set; }
            public decimal Long { get; set; }
        }
    }
}
