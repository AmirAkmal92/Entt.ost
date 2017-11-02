<Query Kind="Program">
  <Reference Relative="..\subscribers\domain.sph.dll">C:\project\work\entt.ost\subscribers\domain.sph.dll</Reference>
  <Reference Relative="..\subscribers\Newtonsoft.Json.dll">C:\project\work\entt.ost\subscribers\Newtonsoft.Json.dll</Reference>
  <Reference Relative="..\subscribers\Ost.ConsigmentRequest.dll">C:\project\work\entt.ost\subscribers\Ost.ConsigmentRequest.dll</Reference>
  <Reference Relative="..\subscribers\Ost.RtsPickupFormat.dll">C:\project\work\entt.ost\subscribers\Ost.RtsPickupFormat.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <Namespace>Bespoke.Ost.ConsigmentRequests.Domain</Namespace>
  <Namespace>Bespoke.Ost.RtsPickupFormats.Domain</Namespace>
  <Namespace>Bespoke.Sph.Domain</Namespace>
  <Namespace>Newtonsoft.Json</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>System.Net.Http</Namespace>
  <Namespace>System.Net.Http.Headers</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
</Query>

async Task Main()
{
	var consignmentRequestId = "05f4d666-e8e5-4e85-8f73-2011dce64c3d";
	var rtsBaseUrl = "https://ezisend.poslaju.com.my/";
	var rtsAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI";
	rtsBaseUrl = "http://localhost:50230/";
	rtsAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";

	var ostClient = new HttpClient { BaseAddress = new Uri(rtsBaseUrl) };
	ostClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", rtsAdminToken);
	ostClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

	var consignmentRequest = await GetConsigmentRequest(consignmentRequestId, ostClient);
	if (consignmentRequest.Id == null) return;

	Console.WriteLine("");
	Console.WriteLine($"Reference No: {consignmentRequest.ReferenceNo}");
	Console.WriteLine($"User Id: {consignmentRequest.UserId}");

	if (!consignmentRequest.Designation.Equals("Contract customer")) return;
	if (consignmentRequest.Pickup.IsPickedUp) return;

	if (!string.IsNullOrEmpty(consignmentRequest.Pickup.Number))
	{
		Console.WriteLine($"Pickup No: {consignmentRequest.Pickup.Number}");
		Console.WriteLine("");
		foreach (var consignment in consignmentRequest.Consignments)
		{
			if (!string.IsNullOrEmpty(consignment.ConNote))
			{
				Console.WriteLine($"Consignment No: {consignment.ConNote}");
				Console.WriteLine($"Total Baby (with parent): {consignment.BabyConnotesTotal}");
				if (consignment.BabyConnotesTotal > 0)
				{
					foreach (var babyConnote in consignment.BabyConnotes)
					{
						Console.WriteLine($"Baby Consignment No: {babyConnote}");
						var rtsPickupFormat = new RtsPickupFormat
						{
							PickupNo = consignmentRequest.Pickup.Number,
							AccountNo = consignmentRequest.UserId,
							ConsignmentNo = babyConnote,
							ParentConsignmentNo = consignment.ConNote,
							TotalBaby = consignment.BabyConnotesTotal - 1,
							PickupDateTime = DateTime.Now,
							ActualWeight = consignment.Produk.Weight,
							CourierId = null,
							CourierName = null,
							BranchCode = null
						};

						//Pickup now!
						await PostRtsPickupFormat(rtsPickupFormat, ostClient);
					}
				}
				else
				{
					var rtsPickupFormat = new RtsPickupFormat
					{
						PickupNo = consignmentRequest.Pickup.Number,
						AccountNo = consignmentRequest.UserId,
						ConsignmentNo = consignment.ConNote,
						ParentConsignmentNo = null,
						TotalBaby = 0,
						PickupDateTime = DateTime.Now,
						ActualWeight = consignment.Produk.Weight,
						CourierId = null,
						CourierName = null,
						BranchCode = null
					};

					//Pickup now!
					await PostRtsPickupFormat(rtsPickupFormat, ostClient);
				}

				//Delay!
				await Task.Delay(500);
			}
		}
	}
}

async Task<ConsigmentRequest> GetConsigmentRequest(string id, HttpClient rtsClient)
{
	var item = new ConsigmentRequest();

	var response = await rtsClient.GetAsync($"/api/consigment-requests/{id}");
	Console.WriteLine($"RequestUri: {response.RequestMessage.RequestUri}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (!response.IsSuccessStatusCode)
	{
		//response.Dump();
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

async Task PostRtsPickupFormat(RtsPickupFormat item, HttpClient rtsClient)
{
	var json = JsonConvert.SerializeObject(item);
	var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
	var response = await rtsClient.PostAsync("/api/rts-pickup-formats", content);
	Console.WriteLine($"RequestUri: {response.RequestMessage.RequestUri}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (!response.IsSuccessStatusCode)
	{
		//response.Dump();
		Console.WriteLine("Aborting .....");
		return;
	}

	var output = string.Empty;
	try
	{
		output = await response.Content.ReadAsStringAsync();
	}
	catch (Exception ex)
	{
		Console.WriteLine($"Error: {ex}");
		Console.WriteLine("Aborting .....");
		return;
	}

	var rtsPickupFormatId = JObject.Parse(output).SelectToken("$.id").Value<string>();
	Console.WriteLine($"Posted: {rtsPickupFormatId}");
	Console.WriteLine("");
	return;
}