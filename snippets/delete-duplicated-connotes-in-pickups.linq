<Query Kind="Program">
  <Reference Relative="..\subscribers\domain.sph.dll">C:\project\work\entt.ost\subscribers\domain.sph.dll</Reference>
  <Reference Relative="..\subscribers\Newtonsoft.Json.dll">C:\project\work\entt.ost\subscribers\Newtonsoft.Json.dll</Reference>
  <Reference Relative="..\subscribers\Ost.ConsigmentRequest.dll">C:\project\work\entt.ost\subscribers\Ost.ConsigmentRequest.dll</Reference>
  <Reference Relative="..\subscribers\Ost.RtsPickupFormat.dll">C:\project\work\entt.ost\subscribers\Ost.RtsPickupFormat.dll</Reference>
  <Reference Relative="..\subscribers\Ost.UserDetail.dll">C:\project\work\entt.ost\subscribers\Ost.UserDetail.dll</Reference>
  <Reference Relative="..\..\entt.rts\subscribers\PosEntt.Pickup.dll">C:\project\work\entt.rts\subscribers\PosEntt.Pickup.dll</Reference>
  <Reference Relative="..\..\entt.rts\subscribers\PosEntt.Stat.dll">C:\project\work\entt.rts\subscribers\PosEntt.Stat.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <Namespace>Bespoke.Ost.ConsigmentRequests.Domain</Namespace>
  <Namespace>Bespoke.Ost.RtsPickupFormats.Domain</Namespace>
  <Namespace>Bespoke.PosEntt.Pickups.Domain</Namespace>
  <Namespace>Bespoke.PosEntt.Stats.Domain</Namespace>
  <Namespace>Bespoke.Sph.Domain</Namespace>
  <Namespace>Newtonsoft.Json</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>System.Net.Http</Namespace>
  <Namespace>System.Net.Http.Headers</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
  <Namespace>Bespoke.Ost.UserDetails.Domain</Namespace>
</Query>

async Task Main()
{
	//PLEASE SET ACCORDINGLY!!!
	var statusOnlyNoPut = true;
	var theConsignmentRequestId = "9fef002b-9038-4986-a92c-fb860b2b5b18";


	var ostBaseUrl = "https://ezisend.poslaju.com.my/";
	var ostAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI"; var rtsClient = new HttpClient();
	var ostClient = new HttpClient { BaseAddress = new Uri(ostBaseUrl) };
	ostClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ostAdminToken);
	ostClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

	var theConsignmentRequest = await GetConsigmentRequest(theConsignmentRequestId, ostClient);
	PrintConnoteNumber(theConsignmentRequest.Consignments.ToList());

	if (statusOnlyNoPut) 
		File.WriteAllText($@"C:\Temp\{theConsignmentRequest.UserId}-{theConsignmentRequest.Id}-before.json", theConsignmentRequest.ToJsonString());

	var distincts = theConsignmentRequest.Consignments.GroupBy(x => x.ConNote).Select(x => x.First()).ToList();

	if (distincts.Count < theConsignmentRequest.Consignments.Count)
	{
		PrintConnoteNumber(distincts);

		theConsignmentRequest.Consignments.Clear();
		foreach (var distinct in distincts)
		{
			theConsignmentRequest.Consignments.Add(distinct);
		}
		PrintConnoteNumber(theConsignmentRequest.Consignments.ToList());

		if (statusOnlyNoPut) 
			File.WriteAllText($@"C:\Temp\{theConsignmentRequest.UserId}-{theConsignmentRequest.Id}-after.json", theConsignmentRequest.ToJsonString());

		await PutConsigmentRequest(theConsignmentRequest, ostClient, statusOnlyNoPut);
	}
}

private void PrintConnoteNumber(List<Consignment> c)
{
	foreach (var x in c)
	{
		Console.WriteLine(x.ConNote);
	}
	Console.WriteLine("");
}

private async Task<ConsigmentRequest> GetConsigmentRequest(string id, HttpClient client)
{
	var item = new ConsigmentRequest();

	var response = await client.GetAsync($"/api/consigment-requests/{id}");
	Console.WriteLine($"RequestUri: {response.RequestMessage.RequestUri}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase}");
	if (!response.IsSuccessStatusCode)
	{
		Console.WriteLine("Aborting .....");
		return item;
	}

	var output = await response.Content.ReadAsStringAsync();
	try
	{
		item = JObject.Parse(output).ToObject<ConsigmentRequest>();
	}
	catch (Exception ex)
	{
		Console.WriteLine($"Error: {ex}");
		Console.WriteLine("Aborting .....");
		return item;
	}

	return item;
}

private static async Task PutConsigmentRequest(ConsigmentRequest consigmentRequest, HttpClient client, bool statusOnlyNoPut)
{
	Console.WriteLine($"Posting: ConsigmentRequest - {consigmentRequest.Id} User - {consigmentRequest.UserId}");

	if (!statusOnlyNoPut)
	{
		var json = JsonConvert.SerializeObject(consigmentRequest);
		var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
		var response = await client.PutAsync($"/api/consigment-requests/{consigmentRequest.Id}", content);
		var output = string.Empty;

		Console.WriteLine($"RequestUri: {response.RequestMessage.RequestUri}");
		Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase}");
		if (response.IsSuccessStatusCode)
		{
			output = await response.Content.ReadAsStringAsync();
		}
		else
		{
			Console.WriteLine("Aborting .....");
		}

		var consigmentRequestId = JObject.Parse(output).SelectToken("$.id").Value<string>();
		Console.WriteLine($"Posted: {consigmentRequestId}");
	}
}