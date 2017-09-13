using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Ost.RtsPickupFormats.Domain;
using Bespoke.Sph.Domain;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace rts.pickup.knockoff
{
    class Program
    {
        private HttpClient m_ostBaseUrl;
        private string m_ostAdminToken;

        public Program()
        {
            m_ostBaseUrl = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230") };
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";
        }

        static void Main(string[] args)
        {
            try
            {
                var program = new Program();
                program.RunAsync().Wait();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }

        public async Task RunAsync()
        {
            List<RtsPickupFormat> rtsPickupFormats = GetRtsPickupFormats();
            Console.WriteLine($"Total parcel(s) to be knockoff: {rtsPickupFormats.Count}pcs");

            foreach (var item in rtsPickupFormats)
            {
                if (!item.IsKnockOff)
                {
                    await NotifyEzisendPickup(item);

                    UpdateRtsPickupFormatStatusAsync(item);

                    await Task.Delay(2000);
                }
            }
        }

        private async Task NotifyEzisendPickup(RtsPickupFormat item)
        {
            var consignmentRequestsPickup = new List<ConsigmentRequest>();
            var consignmentRequestsCart = new List<ConsigmentRequest>();

            //Check data receive from scanner
            if (item.PickupNo == null || item.PickupNo == ""
                || item.AccountNo == null || item.AccountNo == ""
                || item.ConsignmentNo == null || item.ConsignmentNo == "")
            {
                Console.WriteLine($"Incomplete mandotary data.");
            }
            else
            {
                consignmentRequestsPickup = GetConsignmentRequest(item.PickupNo, "true");
                if (consignmentRequestsPickup.Count > 0) //Pickup exist
                {
                    //Clone
                    ConsigmentRequest consignmentRequestPickup = CloneConsignmentRequestPickup(consignmentRequestsPickup);

                    consignmentRequestsCart = GetConsignmentRequest(item.PickupNo, "false");
                    if (consignmentRequestsCart.Count > 0) //Cart exist
                    {
                        //Clone
                        ConsigmentRequest consignmentRequestCart = CloneConsignmentRequestCart(consignmentRequestsCart);

                        //Move
                        var needSaving = MoveConsignmentFromCartToPickup(item.ConsignmentNo, item.ActualWeight, consignmentRequestCart, consignmentRequestPickup);

                        //Save
                        if (needSaving)
                        {
                             SaveChanges(consignmentRequestPickup, consignmentRequestCart);
                        }
                    }
                    else //Cart not exist
                    {
                        //Fall through, there is no consignmentRequest with the scanner`s PickupNo

                        consignmentRequestsCart = GetConsignmentRequestByAccountNo(item.AccountNo, item.ConsignmentNo, "false");
                        if (consignmentRequestsCart.Count > 0) //Cart exist (no pickupNo)
                        {
                            //Clone
                            ConsigmentRequest consignmentRequestCart = CloneConsignmentRequestCart(consignmentRequestsCart);

                            //Move
                            var needSaving = MoveConsignmentFromCartToPickup(item.ConsignmentNo, item.ActualWeight, consignmentRequestCart, consignmentRequestPickup);

                            //Save
                            if (needSaving)
                            {
                                 SaveChanges(consignmentRequestPickup, consignmentRequestCart);
                            }
                        }
                        else
                        {
                            //Fall through
                        }
                    }
                }
                else //Pickup not exist
                {
                    consignmentRequestsCart = GetConsignmentRequest(item.PickupNo, "false");

                    if (consignmentRequestsCart.Count > 0) //Cart exist
                    {
                        //Clone
                        ConsigmentRequest consignmentRequestCart = CloneConsignmentRequestCart(consignmentRequestsCart);

                        //Create
                        ConsigmentRequest consignmentRequestPickup = CreateNewConsignmentRequestPickup(consignmentRequestCart);

                        //Set IsPickedUp
                        consignmentRequestPickup.Pickup.IsPickedUp = true;

                        //Set IsPaid
                        consignmentRequestPickup.Payment.IsPaid = true;

                        //Move
                        var needSaving = MoveConsignmentFromCartToPickup(item.ConsignmentNo, item.ActualWeight, consignmentRequestCart, consignmentRequestPickup);

                        //Save
                        if (needSaving)
                        {
                            Console.WriteLine($"Pickup created");
                             SaveChanges(consignmentRequestPickup, consignmentRequestCart);
                        }
                    }
                    else //Cart not exist
                    {
                        //Fall through, there is no consignmentRequest with the scanner`s PickupNo

                        consignmentRequestsCart = GetConsignmentRequestByAccountNo(item.AccountNo, item.ConsignmentNo, "false");
                        if (consignmentRequestsCart.Count > 0) //Cart exist (no pickupNo)
                        {
                            //Clone
                            ConsigmentRequest consignmentRequestCart = CloneConsignmentRequestCart(consignmentRequestsCart);

                            //Create
                            ConsigmentRequest consignmentRequestPickup = CreateNewConsignmentRequestPickup(consignmentRequestCart);

                            //Set Pickup.Number
                            consignmentRequestPickup.Pickup.Number = item.PickupNo;

                            //Set IsPickedUp
                            consignmentRequestPickup.Pickup.IsPickedUp = true;

                            //Set IsPaid
                            consignmentRequestPickup.Payment.IsPaid = true;

                            //Move
                            var needSaving = MoveConsignmentFromCartToPickup(item.ConsignmentNo, item.ActualWeight, consignmentRequestCart, consignmentRequestPickup);

                            //Save
                            if (needSaving)
                            {
                                Console.WriteLine($"Pickup created");
                                 SaveChanges(consignmentRequestPickup, consignmentRequestCart);
                            }
                        }
                        else
                        {
                            //Fall through
                        }
                    }
                }
            }
        }

        private static ConsigmentRequest CreateNewConsignmentRequestPickup(ConsigmentRequest consignmentRequestCart)
        {
            return new ConsigmentRequest()
            {
                ReferenceNo = consignmentRequestCart.ReferenceNo,
                UserId = consignmentRequestCart.UserId,
                Designation = consignmentRequestCart.Designation,
                Payment = consignmentRequestCart.Payment.Clone(),
                Pickup = consignmentRequestCart.Pickup.Clone(),
                GenerateConnoteCounter = consignmentRequestCart.GenerateConnoteCounter,
                Id = Guid.NewGuid().ToString(),
                WebId = Guid.NewGuid().ToString()
            };
        }

        private void SaveChanges(ConsigmentRequest consignmentRequestPickup, ConsigmentRequest consignmentRequestCart)
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

            UpdateConsignmentRequestAsync(consignmentRequestPickup);
            UpdateConsignmentRequestAsync(consignmentRequestCart);

            if (consignmentRequestCart.Consignments.Count == 0)
            {
                //Empty Cart
                consignmentRequestCart.Pickup = new Bespoke.Ost.ConsigmentRequests.Domain.Pickup();
                consignmentRequestCart.Payment = new Bespoke.Ost.ConsigmentRequests.Domain.Payment();
                consignmentRequestCart.ReferenceNo = Guid.NewGuid().ToString();
                consignmentRequestCart.GenerateConnoteCounter = 0;

                UpdateConsignmentRequestAsync(consignmentRequestCart);

                Console.WriteLine($"Cart Emptied");
            }
        }

        private static bool MoveConsignmentFromCartToPickup(string consignmentNo, decimal actualWeigth, ConsigmentRequest consignmentRequestCart, ConsigmentRequest consignmentRequestPickup)
        {
            var isMatch = false;
            var consignment = new Consignment();
            foreach (var item in consignmentRequestCart.Consignments)
            {
                if (item.ConNote == consignmentNo)
                {
                    item.Bill.ActualWeight = actualWeigth;
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
                Designation = consignmentRequestsCart[0].Designation,
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
                Designation = consignmentRequestsPickup[0].Designation,
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

        private List<ConsigmentRequest> GetConsignmentRequest(string pickupNo, string pickupStatus)
        {
            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            var result = new List<ConsigmentRequest>();
            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/consigment-requests/pickup-no/{pickupNo}/pickup-status/{pickupStatus}";

            try
            {
                var output = m_ostBaseUrl.GetStringAsync(requestUri).Result;
                try
                {
                    var json = JObject.Parse(output).SelectToken("_results");
                    foreach (var jtok in json)
                    {
                        var consigmentRequest = jtok.ToJson().DeserializeFromJson<ConsigmentRequest>();
                        result.Add(consigmentRequest);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Parsing Output");
                    Console.WriteLine($"Status: {ex.Message}");
                    Console.WriteLine("Aborting .....");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"RequestUri: {requestUri.ToString()}");
                Console.WriteLine($"Status: {ex.Message}");
                Console.WriteLine("Aborting .....");
            }


            return result;
        }

        private List<ConsigmentRequest> GetConsignmentRequestByAccountNo(string accountNo, string consignmentNo, string pickupstatus)
        {
            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            var result = new List<ConsigmentRequest>();
            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/consigment-requests/account-no/{accountNo}/consignment-no/{consignmentNo}/pickup-status/{pickupstatus}";

            try
            {
                var output = m_ostBaseUrl.GetStringAsync(requestUri).Result;
                try
                {
                    var json = JObject.Parse(output).SelectToken("_results");
                    foreach (var jtok in json)
                    {
                        var consigmentRequest = jtok.ToJson().DeserializeFromJson<ConsigmentRequest>();
                        result.Add(consigmentRequest);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Parsing Output");
                    Console.WriteLine($"Status: {ex.Message}");
                    Console.WriteLine("Aborting .....");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"RequestUri: {requestUri.ToString()}");
                Console.WriteLine($"Status: {ex.Message}");
                Console.WriteLine("Aborting .....");
            }
            return result;
        }

        private List<RtsPickupFormat> GetRtsPickupFormats()
        {
            var rtsPickupFormats = new List<RtsPickupFormat>();

            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            bool rtsPickupFormatsApi = true;
            int rtsPickupCount = 0;
            int rtsPickupPage = 1;
            int rtsPickupSize = 20;

            while (rtsPickupFormatsApi)
            {
                var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/rts-pickup-formats/is-not-knockoff?size={rtsPickupSize}&page={rtsPickupPage}";
                try
                {
                    var output = m_ostBaseUrl.GetStringAsync(requestUri).Result;
                    try
                    {
                        var json = JObject.Parse(output).SelectToken("_results");
                        foreach (var jtok in json)
                        {
                            var rtsPickupFormat = jtok.ToJson().DeserializeFromJson<RtsPickupFormat>();
                            if (!rtsPickupFormat.IsKnockOff)
                            {
                                rtsPickupFormats.Add(rtsPickupFormat);
                            }
                        }
                        rtsPickupCount = JObject.Parse(output).SelectToken("_count").Value<int>();
                        rtsPickupPage = JObject.Parse(output).SelectToken("_page").Value<int>();
                        rtsPickupSize = JObject.Parse(output).SelectToken("_size").Value<int>();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Parsing Output");
                        Console.WriteLine($"Status: {ex.Message}");
                        Console.WriteLine("Aborting .....");
                        rtsPickupFormatsApi = false;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"RequestUri: {requestUri.ToString()}");
                    Console.WriteLine($"Status: {ex.Message}");
                    Console.WriteLine("Aborting .....");
                    rtsPickupFormatsApi = false;
                }

                if ((rtsPickupPage * rtsPickupSize) >= rtsPickupCount)
                {
                    rtsPickupFormatsApi = false;
                }
                rtsPickupPage++;
            }
            return rtsPickupFormats;
        }

        private void UpdateConsignmentRequestAsync(ConsigmentRequest consignmentRequest)
        {
            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/knockoff-operation/{consignmentRequest.Id.ToString()}";
            var jsonContent = JsonConvert.SerializeObject(consignmentRequest);
            var content = new StringContent(jsonContent.ToString(), Encoding.UTF8, "application/json");

            var response = m_ostBaseUrl.PutAsync(requestUri, content).Result;

            Console.WriteLine($"RequestUri: {requestUri.ToString()}");
            Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"ConsigmentRequest cannot be updated Id: {consignmentRequest.Id} Reference No: {consignmentRequest.ReferenceNo}");
            }
        }

        private void UpdateRtsPickupFormatStatusAsync(RtsPickupFormat updateRtsPickupFormatStatus)
        {
            updateRtsPickupFormatStatus.IsKnockOff = true;

            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/rts-pickup-formats/{updateRtsPickupFormatStatus.Id.ToString()}";
            var jsonContent = JsonConvert.SerializeObject(updateRtsPickupFormatStatus);
            var content = new StringContent(jsonContent.ToString(), Encoding.UTF8, "application/json");

            var response = m_ostBaseUrl.PutAsync(requestUri, content).Result;

            Console.WriteLine($"RequestUri: {requestUri.ToString()}");
            Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"RtsPickupFormat cannot be updated Id: {updateRtsPickupFormatStatus.Id} Consignment No: {updateRtsPickupFormatStatus.ConsignmentNo}");
            }
        }
    }
}
