<Query Kind="Program">
  <Reference Relative="..\subscribers\domain.sph.dll">C:\project\work\entt.ost\subscribers\domain.sph.dll</Reference>
  <Reference Relative="..\subscribers\Ost.PosLajuBranch.dll">C:\project\work\entt.ost\subscribers\Ost.PosLajuBranch.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <NuGetReference>Newtonsoft.Json</NuGetReference>
  <Namespace>Bespoke.Ost.PosLajuBranchBranches.Domain</Namespace>
  <Namespace>Bespoke.Sph.Domain</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>System.Net.Http</Namespace>
  <Namespace>System.Net.Http.Headers</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
  <Namespace>Newtonsoft.Json</Namespace>
</Query>

async Task Main()
{
	var m_ostBaseUrl = "http://localhost:50230";
	var m_ostAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";

	var client = new HttpClient();
	client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

	var queryString = "from=0&size=300";
	var requestUri = new Uri($"{m_ostBaseUrl}/api/pos-laju-branches?{queryString}");
	var response = await client.GetAsync(requestUri);
	var output = string.Empty;

	Console.WriteLine($"RequestUri: {requestUri.ToString()}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (response.IsSuccessStatusCode)
		output = await response.Content.ReadAsStringAsync();
	else
		return;


	var posLajuBranches = new List<PosLajuBranch>();
	var json = JObject.Parse(output).SelectToken("_results");
	foreach (var jtok in json)
	{
		var posLajuBranch = jtok.ToJson().DeserializeFromJson<PosLajuBranch>();
		posLajuBranches.Add(posLajuBranch);
	}
	Console.WriteLine($"Pos Laju Branch count: {posLajuBranches.Count} .....");

	var client2 = new HttpClient();
	client2.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);
	client2.DefaultRequestHeaders.Accept.Clear();
	client2.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
	var requestUri2 = new Uri($"{m_ostBaseUrl}/api/pos-laju-branches");

	foreach (var posLajuBranch in posLajuBranches)
	{
		if (!posLajuBranch.AllowPickup)
		{
			Console.WriteLine(string.Empty);
			posLajuBranch.AllowPickup = true;

			var json2 = JsonConvert.SerializeObject(posLajuBranch);
			var content = new StringContent(json2.ToString(), Encoding.UTF8, "application/json");
			var response2 = await client2.PostAsync(requestUri2, content);
			var output2 = string.Empty;

			Console.WriteLine($"RequestUri: {requestUri2.ToString()}");
			Console.WriteLine($"Status: {(int)response2.StatusCode} {response2.ReasonPhrase.ToString()}");
			if (response2.IsSuccessStatusCode)
				output2 = await response2.Content.ReadAsStringAsync();
			else
				continue;

			output2.Dump();
			Console.WriteLine($"Allow pickup for Pos Laju Branch: {posLajuBranch.Name}");
		}
	}
}
