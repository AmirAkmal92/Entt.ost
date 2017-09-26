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
            //Console.WriteLine("Debug mode: Attached to process then click [ENTER]");
            //Console.ReadLine();
            var startDateTime = string.Empty;
            var endDateTime = string.Empty;

            if (args.Length == 2)
            {
                startDateTime = args[0];
                endDateTime = args[1];

                startDateTime = startDateTime + ":00+08:00";
                endDateTime = endDateTime + ":00+08:00";
            }

            if (args.Length == 1)
            {
                //"unit:interval" //"days:1" //"hours:3" //"minutes:10"

                var start = DateTime.Now;
                var stop = DateTime.Now;

                string[] splitArg = args[0].Split(':');
                var range = int.Parse((splitArg[1]));

                if (splitArg[0] == "days")
                {
                    start = stop.AddDays(-(range));
                }
                if (splitArg[0] == "hours")
                {
                    start = stop.AddHours(-(range));
                }
                if (splitArg[0] == "minutes")
                {
                    start = stop.AddMinutes(-(range));
                }

                startDateTime = start.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ssK");
                endDateTime = stop.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ssK");
            }

            try
            {
                var program = new Program();
                program.RunAsync(startDateTime, endDateTime).Wait();
                Console.WriteLine($"Finished...");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }

        public async Task RunAsync(string start, string end)
        {
            var allRtsPickupFormats = new List<RtsPickupFormat>();
            if (!string.IsNullOrEmpty(start) || !string.IsNullOrEmpty(end))
            {
                allRtsPickupFormats = await GetRtsPickupFormatsWithinRange(start, end);
            }
            else
            {
                allRtsPickupFormats = await GetRtsPickupFormats();
            }
            Console.WriteLine($"Total parcel(s) to be knockoff: {allRtsPickupFormats.Count}pcs");

            var startAllRtsPickupFormats = true;
            var countAllRtsPickupFormatsRemaining = 0;
            var allRtsPickupFormatsRemaining = new List<RtsPickupFormat>();

            if (allRtsPickupFormats.Count > 0)
            {
                while (startAllRtsPickupFormats)
                {
                    if (countAllRtsPickupFormatsRemaining > 0)
                    {
                        allRtsPickupFormats = allRtsPickupFormatsRemaining.Clone();
                        allRtsPickupFormatsRemaining = new List<RtsPickupFormat>();
                        countAllRtsPickupFormatsRemaining = 0;
                    }

                    var knockOffProcess = true;
                    var knockOffProcessIndex = 0;
                    var needSave = true;
                    var consignmentRequestPickups = new List<ConsigmentRequest>();
                    var consignmentRequestPickup = new ConsigmentRequest();
                    var consignmentRequestShipments = new List<ConsigmentRequest>();
                    var consignmentRequestShipment = new ConsigmentRequest();

                    var allRtsPickupFormatsTmp = allRtsPickupFormats.Clone();

                    while (knockOffProcess)
                    {
                        var rtsPickupFormat = allRtsPickupFormatsTmp[knockOffProcessIndex];

                        if (knockOffProcessIndex == 0)
                        {
                            consignmentRequestShipments = await GetConsignmentRequestByAccountNoAsync(rtsPickupFormat.AccountNo, rtsPickupFormat.ConsignmentNo, "false");
                            if (consignmentRequestShipments.Count > 0)
                            {
                                //Found Shipment
                                consignmentRequestShipment = FoundConsignmentRequestShipment(consignmentRequestShipments);

                                consignmentRequestPickups = await GetConsignmentRequestByPickupNoAndStatusAsync(rtsPickupFormat.PickupNo, "true");
                                if (consignmentRequestPickups.Count > 0)
                                {
                                    //Found Pickup
                                    consignmentRequestPickup = FoundConsignmentRequestPickup(consignmentRequestPickups);

                                    //Move
                                    var matchedConnote = MoveConsignmentsFromShipmentToPickup(rtsPickupFormat, consignmentRequestShipment, consignmentRequestPickup);

                                    //update IsKnockOff
                                    UpdateRtsPickupFormatStatusAsync(rtsPickupFormat);
                                }
                                else
                                {
                                    //F4
                                    //Create Pickup
                                    consignmentRequestPickup = CreateNewConsignmentRequestPickup(consignmentRequestShipment, rtsPickupFormat);

                                    //Move
                                    var matchedConnote = MoveConsignmentsFromShipmentToPickup(rtsPickupFormat, consignmentRequestShipment, consignmentRequestPickup);

                                    //Set IsPickedUp
                                    consignmentRequestPickup.Pickup.IsPickedUp = true;

                                    //Set IsPaid
                                    consignmentRequestPickup.Payment.IsPaid = true;

                                    //update IsKnockOff
                                    UpdateRtsPickupFormatStatusAsync(rtsPickupFormat);
                                }
                            }
                            else
                            {
                                //F3
                                needSave = false;

                                //update IsKnockOff
                                UpdateRtsPickupFormatStatusAsync(rtsPickupFormat);
                            }
                        }
                        else
                        {
                            //F2
                            if (consignmentRequestPickup.Pickup.Number == rtsPickupFormat.PickupNo && consignmentRequestPickup.UserId == rtsPickupFormat.AccountNo)
                            {
                                //Move
                                var matchedConnote = MoveConsignmentsFromShipmentToPickup(rtsPickupFormat, consignmentRequestShipment, consignmentRequestPickup);

                                //update IsKnockOff
                                UpdateRtsPickupFormatStatusAsync(rtsPickupFormat);
                            }
                            else
                            {
                                //F6
                                //add to remaining list
                                allRtsPickupFormatsRemaining.Add(rtsPickupFormat);
                            }
                        }

                        //RemoveCurrent
                        allRtsPickupFormats.RemoveAt(0);

                        if (knockOffProcessIndex > allRtsPickupFormatsTmp.Count || allRtsPickupFormats.Count == 0 || consignmentRequestShipment.Consignments.Count == 0)
                        {
                            //F8
                            knockOffProcess = false;
                            if (needSave)
                            {
                                await SaveChanges(consignmentRequestPickup, consignmentRequestShipment);
                            }
                            if (allRtsPickupFormats.Count > 0)
                            {
                                allRtsPickupFormatsRemaining = allRtsPickupFormats.Clone();
                            }
                            if (allRtsPickupFormatsRemaining.Count > 0) { countAllRtsPickupFormatsRemaining++; } else { /*F7*/ startAllRtsPickupFormats = false; }
                        }

                        knockOffProcessIndex++;
                    }
                }
            }
            else
            {
                //F1
            }
        }

        private static ConsigmentRequest CreateNewConsignmentRequestPickup(ConsigmentRequest shipment, RtsPickupFormat rtsPickup)
        {
            var createNewPickup = new ConsigmentRequest()
            {
                ReferenceNo = shipment.ReferenceNo,
                UserId = shipment.UserId,
                Designation = shipment.Designation,
                Payment = shipment.Payment.Clone(),
                Pickup = shipment.Pickup.Clone(),
                GenerateConnoteCounter = shipment.GenerateConnoteCounter,
                Id = Guid.NewGuid().ToString(),
                WebId = Guid.NewGuid().ToString()
            };
            createNewPickup.Pickup.Number = rtsPickup.PickupNo;

            return createNewPickup;
        }

        private async Task<List<ConsigmentRequest>> GetConsignmentRequestByAccountNoAsync(string accountNo, string consignmentNo, string isPickedUp)
        {
            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
            var result = new List<ConsigmentRequest>();
            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/consigment-requests/account-no/{accountNo}/consignment-no/{consignmentNo}/pickup-status/{isPickedUp}";
            var response = await m_ostBaseUrl.GetAsync(requestUri);
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

        private static ConsigmentRequest FoundConsignmentRequestShipment(List<ConsigmentRequest> shipments)
        {
            var shipment = new ConsigmentRequest()
            {
                ReferenceNo = shipments[0].ReferenceNo,
                UserId = shipments[0].UserId,
                Designation = shipments[0].Designation,
                Payment = shipments[0].Payment.Clone(),
                Pickup = shipments[0].Pickup.Clone(),
                GenerateConnoteCounter = shipments[0].GenerateConnoteCounter,
                Id = shipments[0].Id,
                WebId = shipments[0].WebId,
            };
            foreach (var item in shipments[0].Consignments)
            {
                shipment.Consignments.Add(item);
            }
            return shipment;
        }

        private async Task<List<ConsigmentRequest>> GetConsignmentRequestByPickupNoAndStatusAsync(string pickupNo, string isPickedUp)
        {
            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
            var result = new List<ConsigmentRequest>();
            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/consigment-requests/pickup-no/{pickupNo}/pickup-status/{isPickedUp}";
            var response = await m_ostBaseUrl.GetAsync(requestUri);
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

        private static ConsigmentRequest FoundConsignmentRequestPickup(List<ConsigmentRequest> pickups)
        {
            var pickup = new ConsigmentRequest()
            {
                ReferenceNo = pickups[0].ReferenceNo,
                UserId = pickups[0].UserId,
                Designation = pickups[0].Designation,
                Payment = pickups[0].Payment.Clone(),
                Pickup = pickups[0].Pickup.Clone(),
                GenerateConnoteCounter = pickups[0].GenerateConnoteCounter,
                Id = pickups[0].Id,
                WebId = pickups[0].WebId,
            };
            foreach (var item in pickups[0].Consignments)
            {
                pickup.Consignments.Add(item);
            }

            return pickup;
        }

        private static bool MoveConsignmentsFromShipmentToPickup(RtsPickupFormat rts, ConsigmentRequest shipment, ConsigmentRequest pickup)
        {
            var isMatch = false;
            var consignment = new Consignment();
            foreach (var item in shipment.Consignments)
            {
                if (item.ConNote == rts.ConsignmentNo)
                {
                    item.Bill.ActualWeight = rts.ActualWeight;
                    item.Bill.VolumetricWeight = rts.ActualDimensionalWeight;
                    consignment = item;
                    isMatch = true;
                    break;
                }
            }
            if (isMatch)
            {
                shipment.Consignments.Remove(consignment);
                pickup.Consignments.Add(consignment);
            }
            return isMatch;
        }

        private async Task SaveChanges(ConsigmentRequest pickup, ConsigmentRequest shipment)
        {
            Console.WriteLine($"Consignment Request Pickup Number: {pickup.Pickup.Number}");
            Console.WriteLine($"======================");
            var listNumPickups = 0;
            foreach (var consignment in pickup.Consignments)
            {
                Console.WriteLine($"{listNumPickups += 1}. {consignment.ConNote}");
            }

            Console.WriteLine($"Consignment Request Shipment Reference No: {shipment.ReferenceNo}");
            Console.WriteLine($"======================");
            var listNumShipments = 0;
            foreach (var consignment in shipment.Consignments)
            {
                Console.WriteLine($"{listNumShipments += 1}. {consignment.ConNote}");
            }

            if (shipment.Consignments.Count == 0)
            {
                //F5
                shipment.Pickup = new Bespoke.Ost.ConsigmentRequests.Domain.Pickup();
                shipment.Payment = new Bespoke.Ost.ConsigmentRequests.Domain.Payment();
                shipment.ReferenceNo = Guid.NewGuid().ToString();
                shipment.GenerateConnoteCounter = 0;

                Console.WriteLine($"Shipment Emptied");
            }

            UpdateConsignmentRequestAsync(shipment);
            UpdateConsignmentRequestAsync(pickup);

            Console.WriteLine($"");
            Console.WriteLine($". . .Saving Changes Consignment Request (Shipment). . .");
            Console.WriteLine($". . .Saving Changes Consignment Request (Pickup). . .");
            Console.WriteLine($"");

            await Task.Delay(3000);
        }

        private async Task<List<RtsPickupFormat>> GetRtsPickupFormats()
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
                    var output = await m_ostBaseUrl.GetStringAsync(requestUri);
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

        private async Task<List<RtsPickupFormat>> GetRtsPickupFormatsWithinRange(string start, string end)
        {
            var rtsPickupFormats = new List<RtsPickupFormat>();
            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            try
            {
                
                var query = $@"{{
    ""filter"":{{
        ""bool"": {{
            ""must"": [{{
                ""range"":{{
                    ""CreatedDate"":{{
                        ""gte"" : ""{start}"",
                        ""lte"" :  ""{end}""
                        }}
                    }}
                }},
                 {{
                     ""term"":{{
                         ""IsKnockOff"":""false""
                     }}
                 }}],
                  ""must_not"": []
        }}
    }}
}}";

                var content = new StringContent(query.ToString(), Encoding.UTF8, "application/json");
                var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/rts-pickup-formats/search";
                var response = await m_ostBaseUrl.PostAsync(requestUri, content);
                var output = string.Empty;

                Console.WriteLine($"RequestUri: {requestUri.ToString()}");
                Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
                if (response.IsSuccessStatusCode)
                {
                    output = await response.Content.ReadAsStringAsync();
                }
                else
                {
                    Console.WriteLine("Aborting .....");
                    return rtsPickupFormats;
                }
                var json = JObject.Parse(output).SelectToken("hits.hits");
                foreach (var jtok in json)
                {
                    var tmpRtsPickupFormat = jtok.SelectToken("_source").ToJson().DeserializeFromJson<RtsPickupFormat>();
                    rtsPickupFormats.Add(tmpRtsPickupFormat);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
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

        private void UpdateRtsPickupFormatStatusAsync(RtsPickupFormat rtsPickupFormat)
        {
            rtsPickupFormat.IsKnockOff = true;

            m_ostBaseUrl.DefaultRequestHeaders.Clear();
            m_ostBaseUrl.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            var requestUri = $"{m_ostBaseUrl.BaseAddress}/api/rts-pickup-formats/{rtsPickupFormat.Id.ToString()}";
            var jsonContent = JsonConvert.SerializeObject(rtsPickupFormat);
            var content = new StringContent(jsonContent.ToString(), Encoding.UTF8, "application/json");

            var response = m_ostBaseUrl.PutAsync(requestUri, content).Result;

            Console.WriteLine($"RequestUri: {requestUri.ToString()}");
            Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"RtsPickupFormat cannot be updated Id: {rtsPickupFormat.Id} Consignment No: {rtsPickupFormat.ConsignmentNo}");
            }
        }
    }
}
