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

namespace ezisend.fetch.pickup
{
    class Program
    {
        private bool m_doPosting;
        private HttpClient m_ostClient;
        private HttpClient m_rtsClient;
        private string m_ostBaseUrl;
        private string m_ostAdminToken;
        private string m_rtsBaseUrl;
        private string m_rtsAdminToken;

        public Program()
        {
            m_doPosting = true;//posting switch
            m_ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "https://ezisend.poslaju.com.my";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI";
            m_rtsBaseUrl = ConfigurationManager.GetEnvironmentVariable("RtsBaseUrl") ?? "http://rx.pos.com.my";
            m_rtsAdminToken = ConfigurationManager.GetEnvironmentVariable("RtsAdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHBvcy5jb20ubXkiLCJzdWIiOiI2MzYzODk1NjI1NzE1OTY2NTFjNDkwNzRjZSIsIm5iZiI6MTUxOTIyODI1NywiaWF0IjoxNTAzMzMwNjU3LCJleHAiOjE2MDkzNzI4MDAsImF1ZCI6IlBvc0VudHQifQ.-LxvJ8J4bS1xogV3gIoBtMkqlr1h1zP71FUhFA9MuxE";

            m_ostClient = new HttpClient { BaseAddress = new Uri(m_ostBaseUrl) };
            m_ostClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

            m_rtsClient = new HttpClient { BaseAddress = new Uri(m_rtsBaseUrl) };
            m_rtsClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_rtsAdminToken);
        }

        static void Main(string[] args)
        {
            try
            {
                var program = new Program();
                program.RunAsync().Wait();
                Console.WriteLine("Done ......");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }

        public async Task RunAsync()
        {
            var consigmentRequests = await GetConsignmentRequest();
            foreach (var consigmentRequest in consigmentRequests)
            {
                var connotes = new List<string>();
                foreach (var consignment in consigmentRequest.Consignments)
                {
                    if (!string.IsNullOrEmpty(consignment.ConNote))
                    {
                        connotes.Add(consignment.ConNote);
                    }
                }

                var stringOfConnotes = JsonConvert.SerializeObject(connotes);
                Console.WriteLine(string.Empty);
                Console.WriteLine($"Reference Number: {consigmentRequest.ReferenceNo}");
                Console.WriteLine($"Acount Number: {consigmentRequest.UserId}");
                Console.WriteLine($"Connote(s) ({connotes.Count})/({consigmentRequest.Consignments.Count}): {stringOfConnotes}");

                var pickups = await GetPickupEvents(stringOfConnotes);
                if (pickups.Count > 0)
                {
                    Console.WriteLine($"Pickup(s) ({pickups.Count}):");
                    foreach (var pickup in pickups)
                    {
                        var rtsPickupFormat = CreateRtsPickupFormatFromPickup(pickup);
                        await PostRtsPickupFormat(rtsPickupFormat, m_doPosting);
                    }
                }
            }
        }

        private async Task<List<ConsigmentRequest>> GetConsignmentRequest()
        {
            var consigmentRequests = new List<ConsigmentRequest>();
            bool more = true;
            int count = 0;
            int page = 1;
            int size = 20;

            while (more)
            {
                var requestUri = $"/api/consigment-requests/all-est-shipping-cart/?size={size}&page={page}";
                var response = await m_ostClient.GetAsync(requestUri);

                Console.WriteLine($"RequestUri: {response.RequestMessage.RequestUri}");
                Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase}");
                if (!response.IsSuccessStatusCode) break;

                var output = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(output).SelectToken("_results");
                foreach (var jtok in json)
                {
                    var consigmentRequest = jtok.ToJson().DeserializeFromJson<ConsigmentRequest>();
                    if (consigmentRequest.Payment.IsConNoteReady)
                    {
                        consigmentRequests.Add(consigmentRequest);
                    }
                }
                Console.WriteLine($"Consigment Request count: {consigmentRequests.Count} .....");

                count = JObject.Parse(output).SelectToken("_count").Value<int>();
                page = JObject.Parse(output).SelectToken("_page").Value<int>();
                size = JObject.Parse(output).SelectToken("_size").Value<int>();
                if ((page * size) >= count)
                {
                    more = false;
                }
                page++;
            }

            return consigmentRequests;
        }

        private async Task<List<Bespoke.PosEntt.Pickups.Domain.Pickup>> GetPickupEvents(string stringOfConnotes)
        {
            var pickups = new List<Bespoke.PosEntt.Pickups.Domain.Pickup>();
            var query = $@"{{
                ""query"": {{
                    ""bool"": {{
                        ""must"": [              
              		        {{
                  		        ""terms"": {{
                        	        ""ConsignmentNo"": {stringOfConnotes}                     
                  		        }}
              		        }}
           		        ]
        	        }}
   		        }},
   		        ""from"": 0,
   		        ""size"": 1000,
   		        ""sort"": [
      		        {{
         		        ""CreatedDate"": {{
            		        ""order"": ""desc""
         		        }}
      		        }}
   		        ]
	        }}";

            var content = new StringContent(query.ToString(), Encoding.UTF8, "application/json");
            var requestUri = $"/api/rts-dashboard/pickup";
            var response = await m_rtsClient.PostAsync(requestUri, content);

            Console.WriteLine($"RequestUri: {response.RequestMessage.RequestUri}");
            Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase}");
            if (!response.IsSuccessStatusCode)
            {

                Console.WriteLine("Aborting .....");
                return pickups;
            }

            var output = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(output).SelectToken("hits.hits");
            foreach (var jtok in json)
            {
                var source = jtok.SelectToken("_source");
                var pickup = source.ToJson().DeserializeFromJson<Bespoke.PosEntt.Pickups.Domain.Pickup>();
                pickups.Add(pickup);
            }

            return pickups;
        }

        private static RtsPickupFormat CreateRtsPickupFormatFromPickup(Bespoke.PosEntt.Pickups.Domain.Pickup pickup)
        {
            Console.WriteLine($"Creating: {pickup.ConsignmentNo} {pickup.PickupNo} {pickup.AccountNo}");

            return new RtsPickupFormat()
            {
                PickupNo = pickup.PickupNo,
                AccountNo = pickup.AccountNo,
                ConsignmentNo = pickup.ConsignmentNo,
                ParentConsignmentNo = string.Empty, //!
                TotalBaby = pickup.TotalBaby ?? 0,
                PickupDateTime = pickup.Date.AddHours(pickup.Time.Hour).AddMinutes(pickup.Time.Minute).AddSeconds(pickup.Time.Second),
                ActualWeight = pickup.ParentWeight ?? 0.00m,
                ActualDimensionalWeight = pickup.TotalDimWeight ?? 0.00m,
                CourierId = pickup.CourierId,
                CourierName = string.Empty, //!
                BranchCode = pickup.LocationId
            };
        }

        private async Task<bool> PostRtsPickupFormat(RtsPickupFormat rtsPickupFormat, bool doPosting)
        {
            var success = true;

            if (doPosting)
            {
                Console.WriteLine($"Posting: {rtsPickupFormat.ConsignmentNo}{rtsPickupFormat.PickupNo} {rtsPickupFormat.AccountNo}");

                var json = JsonConvert.SerializeObject(rtsPickupFormat);
                var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
                var requestUri = $"/api/rts-pickup-formats";
                var response = await m_ostClient.PostAsync(requestUri, content);

                Console.WriteLine($"RequestUri: {response.RequestMessage.RequestUri}");
                Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase}");
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine("Aborting .....");
                    return false;
                }

                var output = await response.Content.ReadAsStringAsync();
                var rtsPickupFormatId = JObject.Parse(output).SelectToken("$.id").Value<string>();
                Console.WriteLine($"Posted: {rtsPickupFormatId}");
            }

            return success;
        }
    }
}