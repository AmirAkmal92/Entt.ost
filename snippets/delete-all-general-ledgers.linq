<Query Kind="Program">
  <Reference Relative="..\subscribers\domain.sph.dll">C:\project\work\entt.ost\subscribers\domain.sph.dll</Reference>
  <Reference Relative="..\subscribers\Ost.GeneralLedger.dll">C:\project\work\entt.ost\subscribers\Ost.GeneralLedger.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <NuGetReference>Newtonsoft.Json</NuGetReference>
  <Namespace>Bespoke.Ost.GeneralLedgers.Domain</Namespace>
  <Namespace>Bespoke.Sph.Domain</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>RestSharp</Namespace>
  <Namespace>System.Net.Http</Namespace>
  <Namespace>System.Net.Http.Headers</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
</Query>

async Task Main()
{
	var m_ostBaseUrl = "http://localhost:50230";
	var m_ostAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjMyNTE5NjU1NzI2ODY1MDgxYjVjOTMxIiwibmJmIjoxNTEyNzA1MjU2LCJpYXQiOjE0OTY4OTQwNTYsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.3kcLX6wuTQv30dL9sPiSfF716HUtOC_lNPPAdqjp5G8";

	var client = new HttpClient();
	client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

	var requestUri = new Uri($"{m_ostBaseUrl}/api/general-ledgers/");
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
		return;
	}

	var generalLedgers = new List<GeneralLedger>();
	var json = JObject.Parse(output).SelectToken("_results");
	foreach (var jtok in json)
	{
		var generalLedger = jtok.ToJson().DeserializeFromJson<GeneralLedger>();
		generalLedgers.Add(generalLedger);
	}
	Console.WriteLine($"GL count: {generalLedgers.Count} .....");

	foreach (var gl in generalLedgers)
	{
		var deleteUri = new Uri($"{m_ostBaseUrl}/api/general-ledgers/{gl.Id}");
		var responseDelete = await client.DeleteAsync(deleteUri);
		var outputDelete = string.Empty;
		if (responseDelete.IsSuccessStatusCode)
		{
			Console.WriteLine($"DeleteUri: {deleteUri.ToString()}");
			Console.WriteLine($"StatusDelete: {(int)responseDelete.StatusCode} {responseDelete.ReasonPhrase.ToString()}");
			outputDelete = await responseDelete.Content.ReadAsStringAsync();
		}
		else
		{
			Console.WriteLine($"DeleteUri: {deleteUri.ToString()}");
			Console.WriteLine($"StatusDelete: {(int)responseDelete.StatusCode} {responseDelete.ReasonPhrase.ToString()}");
			return;
		}
		outputDelete.Dump();
	}
}
