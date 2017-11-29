using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ezisend.clear.expired.pickup
{
    class Program
    {
        private readonly HttpClient m_ostClient;

        public Program()
        {
            var ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
            var ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";

            m_ostClient = new HttpClient { BaseAddress = new Uri(ostBaseUrl) };
            m_ostClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ostAdminToken);
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
            var now = DateTime.Now;

            foreach (var consigmentRequest in consigmentRequests)
            {
                if (string.IsNullOrEmpty(consigmentRequest.Pickup.Number) || consigmentRequest.Pickup.IsPickedUp ||
                    consigmentRequest.Pickup.DateReady >= now || consigmentRequest.Pickup.DateClose >= now) continue;

                Console.WriteLine($"Renewing: {consigmentRequest.Id}");
                var success = await RenewPickup(consigmentRequest);
                Console.WriteLine();

                if (!success) break;
            }
        }

        private async Task<bool> RenewPickup(ConsigmentRequest consigmentRequest)
        {
            var json = JsonConvert.SerializeObject(consigmentRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var requestUri = $"/consignment-request/renew-pickup/{consigmentRequest.Id}";
            var response = await m_ostClient.PutAsync(requestUri, content);

            Console.WriteLine($"RequestUri: {response.RequestMessage.RequestUri}");
            Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase}");
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine("Aborting .....");
                return false;
            }

            var output = await response.Content.ReadAsStringAsync();
            var consigmentRequestId = JObject.Parse(output).SelectToken("$.id").Value<string>();
            Console.WriteLine($"Renewed: {consigmentRequestId}");

            return true;
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
                consigmentRequests.AddRange(json.Select(jtok => jtok.ToJson().DeserializeFromJson<ConsigmentRequest>()));
                Console.WriteLine($"Consigment Request count: {consigmentRequests.Count} .....");

                var count = JObject.Parse(output).SelectToken("_count").Value<int>();
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
    }
}
