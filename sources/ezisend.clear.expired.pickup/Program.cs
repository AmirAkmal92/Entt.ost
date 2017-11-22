using Bespoke.Ost.ConsigmentRequests.Domain;
using Bespoke.Sph.Domain;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace ezisend.clear.expired.pickup
{
    class Program
    {
        private HttpClient m_ostClient;
        private string m_ostBaseUrl;
        private string m_ostAdminToken;

        public Program()
        {
            m_ostBaseUrl = ConfigurationManager.GetEnvironmentVariable("BaseUrl") ?? "http://localhost:50230";
            m_ostAdminToken = ConfigurationManager.GetEnvironmentVariable("AdminToken") ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";

            m_ostClient = new HttpClient { BaseAddress = new Uri(m_ostBaseUrl) };
            m_ostClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
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
            var now = DateTime.Now;

            foreach (var consigmentRequest in consigmentRequests)
            {
                if (!string.IsNullOrEmpty(consigmentRequest.Pickup.Number)
                    && !consigmentRequest.Pickup.IsPickedUp
                    && consigmentRequest.Pickup.DateReady < now
                    && consigmentRequest.Pickup.DateClose < now)
                {
                    Console.WriteLine($"Renewing: {consigmentRequest.Id}");
                    var success = await RenewPickup(consigmentRequest);
                    Console.WriteLine();
                    if (!success) break;
                }
            }
        }

        private async Task<bool> RenewPickup(ConsigmentRequest consigmentRequest)
        {
            var success = true;
            var json = JsonConvert.SerializeObject(consigmentRequest);
            var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
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

            return success;
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
                    consigmentRequests.Add(consigmentRequest);
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
    }
}
