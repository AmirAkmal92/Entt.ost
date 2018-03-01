using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Ost.RtsPickupFormats.Domain;
using Bespoke.Sph.Domain;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace ezisend.fetch.pickup
{
    class Program
    {
        //private const int MaxFetch = 500;//maximum fetch pickups per request
        private const bool DoPosting = true;//posting switch;
        private readonly HttpClient m_ostClient;
        private readonly HttpClient m_rtsClient;

        public Program()
        {
            var ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "https://ezisend.poslaju.com.my";
            var ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI";
            var rtsBaseUrl = ConfigurationManager.GetEnvironmentVariable("RtsBaseUrl") ?? "http://rx.pos.com.my";
            var rtsAdminToken = ConfigurationManager.GetEnvironmentVariable("RtsAdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHBvcy5jb20ubXkiLCJzdWIiOiI2MzYzODk1NjI1NzE1OTY2NTFjNDkwNzRjZSIsIm5iZiI6MTUxOTIyODI1NywiaWF0IjoxNTAzMzMwNjU3LCJleHAiOjE2MDkzNzI4MDAsImF1ZCI6IlBvc0VudHQifQ.-LxvJ8J4bS1xogV3gIoBtMkqlr1h1zP71FUhFA9MuxE";

            m_ostClient = new HttpClient { BaseAddress = new Uri(ostBaseUrl) };
            m_ostClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ostAdminToken);

            m_rtsClient = new HttpClient { BaseAddress = new Uri(rtsBaseUrl) };
            m_rtsClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", rtsAdminToken);
        }

        private static void Main()
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
                var connotes =
                (from consignment in consigmentRequest.Consignments
                     where !string.IsNullOrEmpty(consignment.ConNote)
                    //select consignment.ConNote).Take(MaxFetch).ToList(); //MaxFetch is only for querying to ES
                    select consignment.ConNote).ToList();

                var stringOfConnotes = JsonConvert.SerializeObject(connotes);
                Console.WriteLine(string.Empty);
                Console.WriteLine($"Reference Number: {consigmentRequest.ReferenceNo}");
                Console.WriteLine($"Acount Number: {consigmentRequest.UserId}");
                Console.WriteLine($"Connote(s) ({connotes.Count})/({consigmentRequest.Consignments.Count}): {stringOfConnotes}");

                if (!connotes.Any()) continue;
                var pickups = await SearchEnttAcceptanceAsync(connotes);

                if (pickups.Count <= 0) continue;
                Console.WriteLine($"Pickup(s) ({pickups.Count}):");
                foreach (var pickup in pickups)
                {
                    var rtsPickupFormat = CreateRtsPickupFormatFromPickup(pickup);
                    await PostRtsPickupFormat(rtsPickupFormat, DoPosting);
                }
            }
        }

        private async Task<List<ConsigmentRequest>> GetConsignmentRequest()
        {
            var consigmentRequests = new List<ConsigmentRequest>();
            var more = true;
            var page = 1;
            var size = 20;

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

                var count = JObject.Parse(output).SelectToken("_count").Value<int>();
                page = JObject.Parse(output).SelectToken("_page").Value<int>();
                size = JObject.Parse(output).SelectToken("_size").Value<int>();
                if (page * size >= count)
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

            var content = new StringContent(query, Encoding.UTF8, "application/json");
            var requestUri = "/api/rts-dashboard/pickup";
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

        private async Task<List<Bespoke.PosEntt.Pickups.Domain.Pickup>> SearchEnttAcceptanceAsync(List<string> listOfConnotes)
        {
            var searchConnotes = String.Join(", ", from s in listOfConnotes select String.Format("'{0}'", s));
            Console.WriteLine(searchConnotes);
            var connString = @"Data Source=10.1.16.124;Initial Catalog=Entt;User Id=sa;Password=P@ssw0rd";
            var conn = new SqlConnection(connString);
            var code = string.Empty;
            var query = $"SELECT [ConsignmentNo],[DateTime],[LocationId],[ShipperAccountNo],[PickupNo],[Parent],[TotalBaby],[TotalWeight],[TotalDimWeight],[CourierId],[CourierName] FROM [Entt].[Entt].[Acceptance] WITH (NOLOCK) WHERE ConsignmentNo IN ({searchConnotes})";
            var list = new List<Bespoke.PosEntt.Pickups.Domain.Pickup>();
            Console.WriteLine(query);
            using (var cmd = new SqlCommand(query, conn))
            {
                if (conn.State != ConnectionState.Open)
                    conn.Open();
                using (var reader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                {
                    while (reader.Read())
                    {
                        var totalBaby = DBNull.Value != reader[6] ? int.Parse(reader[6].ToString()) : 0;
                        var totalWeight = DBNull.Value != reader[7] ? decimal.Parse(reader[7].ToString()) : 0m;
                        var totalDimWeight = DBNull.Value != reader[8] ? decimal.Parse(reader[8].ToString()) : 0m;
                        Console.WriteLine(reader[0].ToString());
                        var pickup = new Bespoke.PosEntt.Pickups.Domain.Pickup
                        {
                            ConsignmentNo = reader[0].ToString(),
                            Date = DateTime.Parse(reader[1].ToString()).Date,
                            Time = DateTime.Parse(reader[1].ToString()),
                            LocationId = DBNull.Value != reader[2] ? reader[2].ToString() : string.Empty,
                            AccountNo = DBNull.Value != reader[3] ? reader[3].ToString() : string.Empty,
                            PickupNo = DBNull.Value != reader[4] ? reader[4].ToString() : string.Empty,
                            TotalBaby = totalBaby,
                            TotalWeight = totalWeight,
                            TotalDimWeight = totalDimWeight,
                            CourierId = DBNull.Value != reader[9] ? reader[9].ToString() : string.Empty
                        };
                        list.Add(pickup);
                    }
                }
            }
            await Task.Delay(1500);
            return list;
        }

        private static RtsPickupFormat CreateRtsPickupFormatFromPickup(Bespoke.PosEntt.Pickups.Domain.Pickup pickup)
        {
            Console.WriteLine($"Creating: {pickup.ConsignmentNo} {pickup.PickupNo} {pickup.AccountNo}");

            return new RtsPickupFormat
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
            if (!doPosting) return true;
            Console.WriteLine($"Posting: {rtsPickupFormat.ConsignmentNo} {rtsPickupFormat.PickupNo} {rtsPickupFormat.AccountNo}");

            var json = JsonConvert.SerializeObject(rtsPickupFormat);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var requestUri = "/api/rts-pickup-formats";
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
            Console.WriteLine("");

            return true;
        }
    }
}