using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Bespoke.PosEntt.CustomActions
{
    public class NotifyEzisendPickup
    {
        private string m_ostBaseUrl;
        private string m_ostAdminToken;
        public NotifyEzisendPickup()
        {
            m_ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";
        }

        public async Task SendNotifyEmail(string emailTo, string emailSubject, string emailMessage,
            string consignmentNo, DateTime pickupDateTime, string pickupNo)
        {
            var emailBody = $@"Hello,

{emailMessage}.
Your item {consignmentNo} has been successfully picked up at {pickupDateTime} with pickup number {pickupNo}.";


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

        public async Task GetRtsPickupEvent(string consignmentNo, DateTime pickupDateTime, string pickupNo)
        {
            var context = new SphDataContext();
            var consignmentRequestsPickup = new List<ConsigmentRequest>();
            var consignmentRequestsCart = new List<ConsigmentRequest>();

            consignmentRequestsPickup = await GetConsignmentRequestAsync(pickupNo, "true");
            if (consignmentRequestsPickup.Count > 0) //Pickup exist
            {
                //Clone
                ConsigmentRequest consignmentRequestPickup = CloneConsignmentRequestPickup(consignmentRequestsPickup);

                consignmentRequestsCart = await GetConsignmentRequestAsync(pickupNo, "false");
                if (consignmentRequestsCart.Count > 0) //Cart exist
                {
                    //Clone
                    ConsigmentRequest consignmentRequestCart = CloneConsignmentRequestCart(consignmentRequestsCart);

                    //Move
                    var needSaving = MoveConsignmentFromCartToPickup(consignmentNo, consignmentRequestCart, consignmentRequestPickup);

                    //Save
                    if (needSaving)
                    {
                        await SaveChanges(context, consignmentRequestPickup, consignmentRequestCart);
                    }
                }
                else //Cart not exist
                {
                    //Fall through
                }
            }
            else //Pickup not exist
            {
                consignmentRequestsCart = await GetConsignmentRequestAsync(pickupNo, "false");

                if (consignmentRequestsCart.Count > 0) //Cart exist
                {
                    //Clone
                    ConsigmentRequest consignmentRequestCart = CloneConsignmentRequestCart(consignmentRequestsCart);
                    
                    //Create
                    var consignmentRequestPickup = new ConsigmentRequest()
                    {
                        ReferenceNo = consignmentRequestCart.ReferenceNo,
                        UserId = consignmentRequestCart.UserId,
                        Payment = consignmentRequestCart.Payment.Clone(),
                        Pickup = consignmentRequestCart.Pickup.Clone(),
                        GenerateConnoteCounter = consignmentRequestCart.GenerateConnoteCounter,
                        Id = Guid.NewGuid().ToString(),
                        WebId = Guid.NewGuid().ToString()
                    };

                    //Set IsPickedUp
                    consignmentRequestPickup.Pickup.IsPickedUp = true;

                    //Set IsPaid
                    consignmentRequestPickup.Payment.IsPaid = true;

                    //Move
                    var needSaving = MoveConsignmentFromCartToPickup(consignmentNo, consignmentRequestCart, consignmentRequestPickup);

                    //Save
                    if (needSaving)
                    {
                        Console.WriteLine($"Pickup created");
                        await SaveChanges(context, consignmentRequestPickup, consignmentRequestCart);
                    }
                }
                else //Cart not exist
                {
                    //Fall through
                }
            }
        }

        private static async Task SaveChanges(SphDataContext context, ConsigmentRequest consignmentRequestPickup, ConsigmentRequest consignmentRequestCart)
        {
            Console.WriteLine($"Consignment Request Pickup Number: {consignmentRequestPickup.Pickup.Number}");
            Console.WriteLine($"======================");
            var countPickup = 0;
            foreach (var itemConsignments in consignmentRequestPickup.Consignments)
            {
                Console.WriteLine($"{countPickup += 1}. {itemConsignments.ConNote}");
            }

            Console.WriteLine($"Consignment Request Cart Reference No: {consignmentRequestCart.ReferenceNo}");
            Console.WriteLine($"======================");
            var countCart = 0;
            foreach (var itemConsignments in consignmentRequestCart.Consignments)
            {
                Console.WriteLine($"{countCart += 1}. {itemConsignments.ConNote}");
            }

            using (var session = context.OpenSession())
            {
                session.Attach(consignmentRequestPickup);
                session.Attach(consignmentRequestCart);
                await session.SubmitChanges("Default");
            }

            if (consignmentRequestCart.Consignments.Count == 0)
            {
                //Empty Cart
                consignmentRequestCart.Pickup = new Bespoke.Ost.ConsigmentRequests.Domain.Pickup();
                consignmentRequestCart.Payment = new Bespoke.Ost.ConsigmentRequests.Domain.Payment();
                consignmentRequestCart.ReferenceNo = Guid.NewGuid().ToString();
                consignmentRequestCart.GenerateConnoteCounter = 0;
                using (var session = context.OpenSession())
                {
                    session.Attach(consignmentRequestCart);
                    await session.SubmitChanges("Default");
                }
                Console.WriteLine($"Cart Emptied");
            }
        }

        private static bool MoveConsignmentFromCartToPickup(string consignmentNo, ConsigmentRequest consignmentRequestCart, ConsigmentRequest consignmentRequestPickup)
        {
            var isMatch = false;
            var consignment = new Consignment();
            foreach (var item in consignmentRequestCart.Consignments)
            {
                if (item.ConNote == consignmentNo)
                {
                    consignment = item;
                    isMatch = true;
                    break;
                }
            }
            if (isMatch)
            {
                consignmentRequestCart.Consignments.Remove(consignment);
                consignmentRequestPickup.Consignments.Add(consignment);
            }
            return isMatch;
        }

        private static ConsigmentRequest CloneConsignmentRequestCart(List<ConsigmentRequest> consignmentRequestsCart)
        {
            var consignmentRequestCart = new ConsigmentRequest()
            {
                ReferenceNo = consignmentRequestsCart[0].ReferenceNo,
                UserId = consignmentRequestsCart[0].UserId,
                Payment = consignmentRequestsCart[0].Payment.Clone(),
                Pickup = consignmentRequestsCart[0].Pickup.Clone(),
                GenerateConnoteCounter = consignmentRequestsCart[0].GenerateConnoteCounter,
                Id = consignmentRequestsCart[0].Id,
                WebId = consignmentRequestsCart[0].WebId,
            };
            foreach (var item in consignmentRequestsCart[0].Consignments)
            {
                consignmentRequestCart.Consignments.Add(item);
            }

            return consignmentRequestCart;
        }

        private static ConsigmentRequest CloneConsignmentRequestPickup(List<ConsigmentRequest> consignmentRequestsPickup)
        {
            var consignmentRequestPickup = new ConsigmentRequest()
            {
                ReferenceNo = consignmentRequestsPickup[0].ReferenceNo,
                UserId = consignmentRequestsPickup[0].UserId,
                Payment = consignmentRequestsPickup[0].Payment.Clone(),
                Pickup = consignmentRequestsPickup[0].Pickup.Clone(),
                GenerateConnoteCounter = consignmentRequestsPickup[0].GenerateConnoteCounter,
                Id = consignmentRequestsPickup[0].Id,
                WebId = consignmentRequestsPickup[0].WebId,
            };
            foreach (var item in consignmentRequestsPickup[0].Consignments)
            {
                consignmentRequestPickup.Consignments.Add(item);
            }

            return consignmentRequestPickup;
        }

        private async Task<List<ConsigmentRequest>> GetConsignmentRequestAsync(string pickupNo, string pickupStatus)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
            var result = new List<ConsigmentRequest>();
            var requestUri = new Uri($"{m_ostBaseUrl}/api/consigment-requests/pickup-no/{pickupNo}/pickup-status/{pickupStatus}");
            var response = await client.GetAsync(requestUri);
            var output = string.Empty;
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine($"RequestUri: {requestUri.ToString()}");
                Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
                output = await response.Content.ReadAsStringAsync();
            }
            else
            {
                Console.WriteLine($"RequestUri: {requestUri.ToString()}");
                Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
                return result;
            }
            var json = JObject.Parse(output).SelectToken("_results");
            foreach (var jtok in json)
            {
                var consigmentRequest = jtok.ToJson().DeserializeFromJson<ConsigmentRequest>();
                result.Add(consigmentRequest);
            }
            return result;
        }
    }
}
