using Bespoke.Ost.EstRegistrations.Domain;
using Bespoke.Sph.Domain;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Bespoke.PosEntt.CustomActions
{

    public class NotifySnbRegister
    {
        private string m_snbClientApi;
        private string m_ostAdminToken;
        private object m_ostBaseUrl;

        public NotifySnbRegister()
        {
            m_snbClientApi = ConfigurationManager.GetEnvironmentVariable("SnbWebApi") ?? "http://10.1.1.119:9002/api";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjM2NDU0NjQwMDUxNTM1NDgzMzQ5NDk0IiwibmJmIjoxNTE2NzI2NjQwLCJpYXQiOjE1MDA4MjkwNDAsImV4cCI6MTU1MTMxMjAwMCwiYXVkIjoiT3N0In0.nrTj7TkvBVpEs_4XBeh_63Ke_VC2Gwvm8TglOGIWOVY";
            m_ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
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
            Console.WriteLine($"===============================================");
            Console.WriteLine($"Id: {item.Id}");
            Console.WriteLine($"Ref No: {item.RefNo}");
            Console.WriteLine($"===============================================");

            Profile Profile = CreateProfile(item);

            var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.BaseAddress = new Uri($"{m_snbClientApi}/create-cust");
            var json = JsonConvert.SerializeObject(Profile);
            var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");

            var result = client.PostAsync(client.BaseAddress, content).Result;
            Console.WriteLine($"First level sending to Snb API (Data)...");

            var outputString = await result.Content.ReadAsStringAsync();
            if (result.IsSuccessStatusCode)
            {
                var jsonOutput = JObject.Parse(outputString).SelectToken("refno");
                Console.WriteLine($"Reference Number: {jsonOutput}");
                Console.WriteLine($"===============================================");

                item.RefNo = jsonOutput.ToString();
                await SaveEstRegistration(item);
                await Task.Delay(2500);

                await RegisterNewContractCustomerFile(item.Id);
            }
            else
            {
                var jsonOutput = JObject.Parse(outputString).SelectToken("Message");
                Console.WriteLine($"Error Message: {jsonOutput}");
                Console.WriteLine($"===============================================");
            }
        }

        private async Task RegisterNewContractCustomerFile(string id)
        {
            var item = new EstRegistration();
            item = await GetEstRegistrationAsync(id);

            Console.WriteLine($"===============================================");
            Console.WriteLine($"Id: {item.Id}");
            Console.WriteLine($"Ref No: {item.RefNo}");
            Console.WriteLine($"===============================================");

            Profile Profile = CreateProfile(item);
            Profile.RefNo = item.RefNo;

            var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.BaseAddress = new Uri($"{m_snbClientApi}/create-cust");
            var json = JsonConvert.SerializeObject(Profile);
            var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");

            var result = client.PostAsync(client.BaseAddress, content).Result;
            Console.WriteLine($"Second level sending to Snb API (Document)...");

            var outputString = await result.Content.ReadAsStringAsync();
            if (result.IsSuccessStatusCode)
            {
                var jsonOutput = JObject.Parse(outputString).SelectToken("status");
                Console.WriteLine($"Snb Status: {jsonOutput}");
                Console.WriteLine($"===============================================");

                await DeleteEstRegistrationDocuments(id);
                //await Task.Delay(2500);
                //await DeleteEstRegistration(id);
                //await Task.Delay(2500);
            }
            else
            {
                var jsonOutput = JObject.Parse(outputString).SelectToken("Message");
                Console.WriteLine($"Error Message: {jsonOutput}");
                Console.WriteLine($"===============================================");
            }
        }

        private static async Task SaveEstRegistration(EstRegistration EstRegistration)
        {
            var context = new SphDataContext();
            using (var session = context.OpenSession())
            {
                session.Attach(EstRegistration);
                await session.SubmitChanges("Default");
            }
        }

        private async Task<EstRegistration> GetEstRegistrationAsync(string id)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
            var result = new EstRegistration();
            var requestUri = new Uri($"{m_ostBaseUrl}/api/est-registrations/{id}");
            var response = await client.GetAsync(requestUri);
            var output = string.Empty;
            output = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(output);
            var estRegistration = json.ToJson().DeserializeFromJson<EstRegistration>();
            return estRegistration;
        }

        private static Profile CreateProfile(EstRegistration item)
        {
            var Profile = new Profile
            {
                UserId = item.UserId,
                Id = item.Id,
                SbuName = item.SbuName,
                RefNo = item.RefNo,
                Documents = new List<Document> { },

                PersonalDetail = new PersonDetail
                {
                    MailingAddress = new MailAddress
                    {
                        Address1 = item.PersonalDetail.MailingAddress.Address1,
                        Address2 = item.PersonalDetail.MailingAddress.Address2,
                        Address3 = item.PersonalDetail.MailingAddress.Address3,
                        Address4 = item.PersonalDetail.MailingAddress.Address4,
                        City = item.PersonalDetail.MailingAddress.City,
                        State = "PAH", //TODO
                        Country = "MY", //TODO
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
                        State = "PAH", //TODO
                        Country = "MY", //TODO
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
                        State = "PAH", //TODO
                        Country = "MY", //TODO
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
                    Industry = "C07", //TODO Import Lookups
                    TypePosting = item.CompanyInformation.TypePosting,
                    IsPosLajuAgent = item.CompanyInformation.IsPosLajuAgent,
                    RocNumber = item.CompanyInformation.RocNumber,
                    CurrencyCode = "MYR", //TODO Import Lookups
                },
                DirectorInformations = new List<DirectorInformation> { }
            };

            foreach (var directorInformation in item.DirectorInformation)
            {
                Profile.DirectorInformations.Add(
                    new DirectorInformation
                    {
                        DirectorName = directorInformation.DirectorName,
                        DirectorIcNumber = directorInformation.DirectorIcNumber,
                        DirectorUserId = directorInformation.DirectorUserId
                    });
            };

            if (item.FormP13AndTnc.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.FormP13AndTnc.BinaryStoreId,
                    DocTypeId = item.FormP13AndTnc.DocTypeId,
                    DocType = item.FormP13AndTnc.DocName
                });
                Console.WriteLine($"Store Id: {item.FormP13AndTnc.BinaryStoreId}, Document Name: Form P13 And TNC");
            }
            if (item.CtosCompany.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.CtosCompany.BinaryStoreId,
                    DocTypeId = item.CtosCompany.DocTypeId,
                    DocType = item.CtosCompany.DocName
                });
                Console.WriteLine($"Store Id: {item.CtosCompany.BinaryStoreId}, Document Name: CTOS - Company");
            }
            if (item.CtosOwnerDirectors.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.CtosOwnerDirectors.BinaryStoreId,
                    DocTypeId = item.CtosOwnerDirectors.DocTypeId,
                    DocType = item.CtosOwnerDirectors.DocName
                });
                Console.WriteLine($"Store Id: {item.CtosOwnerDirectors.BinaryStoreId}, Document Name: CTOS - Owner / Directors");
            }
            if (item.IcCopy.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.IcCopy.BinaryStoreId,
                    DocTypeId = item.IcCopy.DocTypeId,
                    DocType = item.IcCopy.DocName
                });
                Console.WriteLine($"Store Id: {item.IcCopy.BinaryStoreId}, Document Name: IC Copy");
            }
            if (item.BusinessCard.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.BusinessCard.BinaryStoreId,
                    DocTypeId = item.BusinessCard.DocTypeId,
                    DocType = item.BusinessCard.DocName
                });
                Console.WriteLine($"Store Id: {item.BusinessCard.BinaryStoreId}, Document Name: Business Card");
            }
            if (item.Form913.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.Form913.BinaryStoreId,
                    DocTypeId = item.Form913.DocTypeId,
                    DocType = item.Form913.DocName
                });
                Console.WriteLine($"Store Id: {item.Form913.BinaryStoreId}, Document Name: Form 9 / 13");
            }
            if (item.Form24.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.Form24.BinaryStoreId,
                    DocTypeId = item.Form24.DocTypeId,
                    DocType = item.Form24.DocName
                });
                Console.WriteLine($"Store Id: {item.Form24.BinaryStoreId}, Document Name: Form 24");
            }
            if (item.Form49.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.Form49.BinaryStoreId,
                    DocTypeId = item.Form49.DocTypeId,
                    DocType = item.Form49.DocName
                });
                Console.WriteLine($"Store Id: {item.Form49.BinaryStoreId}, Document Name: Form 49");
            }
            if (item.Borang48.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.Borang48.BinaryStoreId,
                    DocTypeId = item.Borang48.DocTypeId,
                    DocType = item.Borang48.DocName
                });
                Console.WriteLine($"Store Id: {item.Borang48.BinaryStoreId}, Document Name: Borang 48");
            }
            if (item.DepositSlip.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.DepositSlip.BinaryStoreId,
                    DocTypeId = item.DepositSlip.DocTypeId,
                    DocType = item.DepositSlip.DocName
                });
                Console.WriteLine($"Store Id: {item.DepositSlip.BinaryStoreId}, Document Name: Deposit Slip");
            }
            if (item.AuthorizeLetter.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.AuthorizeLetter.BinaryStoreId,
                    DocTypeId = item.AuthorizeLetter.DocTypeId,
                    DocType = item.AuthorizeLetter.DocName
                });
                Console.WriteLine($"Store Id: {item.AuthorizeLetter.BinaryStoreId}, Document Name: Authorize Letter (with letterhead)");
            }
            if (item.GstCertificationLetter.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.GstCertificationLetter.BinaryStoreId,
                    DocTypeId = item.GstCertificationLetter.DocTypeId,
                    DocType = item.GstCertificationLetter.DocName
                });
                Console.WriteLine($"Store Id: {item.GstCertificationLetter.BinaryStoreId}, Document Name: GST Certification Letter");
            }
            if (item.OtherDocuments.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.OtherDocuments.BinaryStoreId,
                    DocTypeId = item.OtherDocuments.DocTypeId,
                    DocType = item.OtherDocuments.DocName
                });
                Console.WriteLine($"Store Id: {item.OtherDocuments.BinaryStoreId}, Document Name: Other Documents");
            }
            if (item.FormDE.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.FormDE.BinaryStoreId,
                    DocTypeId = item.FormDE.DocTypeId,
                    DocType = item.FormDE.DocName
                });
                Console.WriteLine($"Store Id: {item.FormDE.BinaryStoreId}, Document Name: Form D / E");
            }
            if (item.BorangSsmMaklumatPerniagaan.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.BorangSsmMaklumatPerniagaan.BinaryStoreId,
                    DocTypeId = item.BorangSsmMaklumatPerniagaan.DocTypeId,
                    DocType = item.BorangSsmMaklumatPerniagaan.DocName
                });
                Console.WriteLine($"Store Id: {item.BorangSsmMaklumatPerniagaan.BinaryStoreId}, Document Name: Borang SSM - Maklumat Perniagaan");
            }
            if (item.BorangSsmMaklumatPemilik.BinaryStoreId != null)
            {
                Profile.Documents.Add(new Document
                {
                    Id = item.BorangSsmMaklumatPemilik.BinaryStoreId,
                    DocTypeId = item.BorangSsmMaklumatPemilik.DocTypeId,
                    DocType = item.BorangSsmMaklumatPemilik.DocName
                });
                Console.WriteLine($"Store Id: {item.BorangSsmMaklumatPemilik.BinaryStoreId}, Document Name: Borang SSM - Maklumat pemilik masa kini");
            }
            Console.WriteLine($"===============================================");
            return Profile;
        }

        private async Task DeleteEstRegistration(string id)
        {
            var context = new SphDataContext();
            EstRegistration item = await GetEstRegistrationAsync(id);
            Console.WriteLine($"Preparing to delete EstRegistration with Id: {item.Id}");
            Console.WriteLine($"===============================================");

            using (var session = context.OpenSession())
            {
                session.Delete(item);
                await session.SubmitChanges("Default");
            }
        }

        private async Task DeleteEstRegistrationDocuments(string id)
        {
            var context = new SphDataContext();
            EstRegistration item = await GetEstRegistrationAsync(id);
            Console.WriteLine($"Preparing to delete Binary Store for EstRegistration with Id: {item.Id}");
            Console.WriteLine($"===============================================");
            var store = ObjectBuilder.GetObject<IBinaryStore>();
            if (item.FormP13AndTnc.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Form P13 And TNC");
                Console.WriteLine($"Document Store Id: {item.FormP13AndTnc.BinaryStoreId}");
                await store.DeleteAsync(item.FormP13AndTnc.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.CtosCompany.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: CTOS - Company");
                Console.WriteLine($"Document Store Id: {item.CtosCompany.BinaryStoreId}");
                await store.DeleteAsync(item.CtosCompany.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.CtosOwnerDirectors.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: CTOS - Owner / Directors");
                Console.WriteLine($"Document Store Id: {item.CtosOwnerDirectors.BinaryStoreId}");
                await store.DeleteAsync(item.CtosOwnerDirectors.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.IcCopy.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: IC Copy");
                Console.WriteLine($"Document Store Id: {item.IcCopy.BinaryStoreId}");
                await store.DeleteAsync(item.IcCopy.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.BusinessCard.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Business Card");
                Console.WriteLine($"Document Store Id: {item.BusinessCard.BinaryStoreId}");
                await store.DeleteAsync(item.BusinessCard.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.Form913.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Form 9 / 13");
                Console.WriteLine($"Document Store Id: {item.Form913.BinaryStoreId}");
                await store.DeleteAsync(item.Form913.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.Form24.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Form 24");
                Console.WriteLine($"Document Store Id: {item.Form24.BinaryStoreId}");
                await store.DeleteAsync(item.Form24.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.Form49.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Form 49");
                Console.WriteLine($"Document Store Id: {item.Form49.BinaryStoreId}");
                await store.DeleteAsync(item.Form49.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.Borang48.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Borang 48");
                Console.WriteLine($"Document Store Id: {item.Borang48.BinaryStoreId}");
                await store.DeleteAsync(item.Borang48.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.DepositSlip.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Deposit Slip");
                Console.WriteLine($"Document Store Id: {item.DepositSlip.BinaryStoreId}");
                await store.DeleteAsync(item.DepositSlip.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.AuthorizeLetter.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Authorize Letter");
                Console.WriteLine($"Document Store Id: {item.AuthorizeLetter.BinaryStoreId}");
                await store.DeleteAsync(item.AuthorizeLetter.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.GstCertificationLetter.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: GST Certification Letter");
                Console.WriteLine($"Document Store Id: {item.GstCertificationLetter.BinaryStoreId}");
                await store.DeleteAsync(item.GstCertificationLetter.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.OtherDocuments.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Other Documents");
                Console.WriteLine($"Document Store Id: {item.OtherDocuments.BinaryStoreId}");
                await store.DeleteAsync(item.OtherDocuments.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.FormDE.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Form D / E");
                Console.WriteLine($"Document Store Id: {item.FormDE.BinaryStoreId}");
                await store.DeleteAsync(item.FormDE.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.BorangSsmMaklumatPerniagaan.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Borang SSM - Maklumat Perniagaan");
                Console.WriteLine($"Document Store Id: {item.BorangSsmMaklumatPerniagaan.BinaryStoreId}");
                await store.DeleteAsync(item.BorangSsmMaklumatPerniagaan.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
            if (item.BorangSsmMaklumatPemilik.BinaryStoreId != null)
            {
                Console.WriteLine($"Deleting file...");
                Console.WriteLine($"Document Name: Borang SSM - Maklumat pemilik masa kini");
                Console.WriteLine($"Document Store Id: {item.BorangSsmMaklumatPemilik.BinaryStoreId}");
                await store.DeleteAsync(item.BorangSsmMaklumatPemilik.BinaryStoreId);
                Console.WriteLine($"===============================================");
            }
        }
    }
}
