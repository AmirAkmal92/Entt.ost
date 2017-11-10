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
	var statusOnlyNoPost = true;

	var rtsBaseUrl = "http://rx.pos.com.my";
	var rtsAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHBvcy5jb20ubXkiLCJzdWIiOiI2MzYzODk1NjI1NzE1OTY2NTFjNDkwNzRjZSIsIm5iZiI6MTUxOTIyODI1NywiaWF0IjoxNTAzMzMwNjU3LCJleHAiOjE2MDkzNzI4MDAsImF1ZCI6IlBvc0VudHQifQ.-LxvJ8J4bS1xogV3gIoBtMkqlr1h1zP71FUhFA9MuxE";
	var rtsClient = new HttpClient();
	rtsClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", rtsAdminToken);

	//	var ostBaseUrl = "http://localhost:50230";
	//	var ostAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";
	var ostBaseUrl = "https://ezisend.poslaju.com.my";
	var ostAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI";
	var ostClient = new HttpClient();
	ostClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ostAdminToken);

	Console.WriteLine("-------------------- GET CONSIGNMENT REQUESTS --------------------");
	var consignmentRequests = await GetConsignmentRequests(ostBaseUrl, ostClient);
	Console.WriteLine($"Consignment Requests count: {consignmentRequests.Count} .....");
	//	consignmentRequests.Dump();
	Console.WriteLine("");
	Console.WriteLine("");

	var consignmentRequestsIndexCount = 1;
	foreach (var consignmentRequest in consignmentRequests)
	{		
		var connotes = new List<string>();

		Console.WriteLine("");
		Console.WriteLine($"({consignmentRequestsIndexCount}) {consignmentRequest.Id}");
		Console.WriteLine("");

		foreach (var consignment in consignmentRequest.Consignments)
		{
			if (!string.IsNullOrEmpty(consignment.ConNote))
			{
				connotes.Add(consignment.ConNote);
			}
		}
		var strOfConnotes = JsonConvert.SerializeObject(connotes);
		Console.WriteLine($"Reference Number: {consignmentRequest.ReferenceNo}");
		Console.WriteLine($"Acount Number: {consignmentRequest.UserId}");

		var userDetail = new UserDetail();
		var pickupNoFromConsole = string.Empty;
		if (!string.IsNullOrEmpty(consignmentRequest.Pickup.Number))
		{

			Console.WriteLine($"Pickup Number: {consignmentRequest.Pickup.Number}");
			Console.WriteLine($"Contact Person: {consignmentRequest.Pickup.ContactPerson}");
			Console.WriteLine($"Contact Number: {consignmentRequest.Pickup.ContactInformation.ContactNumber}");
			Console.WriteLine($"Company Name: {consignmentRequest.Pickup.CompanyName}");
		}
		else
		{
			Console.WriteLine("Pickup Not Set. Get details from default pickup address...");
			Console.WriteLine("");
			Console.WriteLine("-------------------- GET USER DETAIL --------------------");
			userDetail = await GetUserDetail(consignmentRequest.UserId, ostBaseUrl, ostClient);
			if (userDetail.UserId.Equals(consignmentRequest.UserId))
			{
				Console.WriteLine($"Contact Person: {userDetail.PickupAddress.ContactPerson}");
				Console.WriteLine($"Contact Number: {userDetail.PickupAddress.ContactInformation.ContactNumber}");
				Console.WriteLine($"Company Name: {userDetail.PickupAddress.CompanyName}");
			}
		}

		Console.WriteLine("");
		Console.WriteLine($"Check Pickup status for: {strOfConnotes}");
		Console.WriteLine($"Connotes Count: {consignmentRequest.Consignments.Count}");
		Console.WriteLine("");
		Console.WriteLine("-------------------- GET PICKUP EVENTS --------------------");
		var pickupEvents = await GetPickupEvents(strOfConnotes, rtsBaseUrl, rtsClient);
		Console.WriteLine($"Pickup Events count: {pickupEvents.Count} .....");
		pickupEvents.Dump();
		Console.WriteLine("");

		if (pickupEvents.Count > 0)
		{
			foreach (var pickupEvent in pickupEvents)
			{
				Console.WriteLine("");
				Console.WriteLine("-------------------- POST RTS PICKUP FORMAT (by PICKUP EVENTS) --------------------");
				var rtsPickupFormat = new RtsPickupFormat
				{
					PickupNo = pickupEvent.PickupNo,
					AccountNo = pickupEvent.AccountNo,
					ConsignmentNo = pickupEvent.ConsignmentNo,
					ParentConsignmentNo = string.Empty, //?
					TotalBaby = pickupEvent.TotalBaby.HasValue ? pickupEvent.TotalBaby.Value : 0,
					PickupDateTime = pickupEvent.Date.AddHours(pickupEvent.Time.Hour).AddMinutes(pickupEvent.Time.Minute).AddSeconds(pickupEvent.Time.Second),
					ActualWeight = pickupEvent.ParentWeight.HasValue ? pickupEvent.ParentWeight.Value : 0.00m,
					CourierId = pickupEvent.CourierId,
					CourierName = string.Empty, //?
					BranchCode = pickupEvent.LocationId
				};
				await PostRtsPickupFormat(rtsPickupFormat, ostBaseUrl, ostClient, statusOnlyNoPost);
				if (!statusOnlyNoPost) await Task.Delay(500);
			}
		}
		else
		{
			Console.WriteLine("Pickup Events not found. Get details from stat events...");
			Console.WriteLine($"Check Pickup status for: {strOfConnotes}");
			Console.WriteLine($"Connotes Count: {consignmentRequest.Consignments.Count}");
			Console.WriteLine("");
			Console.WriteLine("-------------------- GET STAT EVENTS --------------------");
			var statEvents = await GetStatEvents(strOfConnotes, rtsBaseUrl, rtsClient);
			Console.WriteLine($"Pickup Events count: {statEvents.Count} .....");
			statEvents.Dump();
			Console.WriteLine("");

			if (statEvents.Count > 0)
			{
				if (string.IsNullOrEmpty(consignmentRequest.Pickup.Number))
				{
					Console.WriteLine($"Please insert Pickup Number for Reference Number: {consignmentRequest.ReferenceNo}");
					pickupNoFromConsole = Console.ReadLine();
				}
			}

			foreach (var statEvent in statEvents)
			{
				Console.WriteLine("");
				Console.WriteLine("-------------------- POST RTS PICKUP FORMAT (by STAT EVENTS) --------------------");

				var text = statEvent.Comment;
				string[] words = text.Split('|');
				var text2 = words[1].Replace(" ", string.Empty);
				string[] words2 = text2.Split('=');
				var berat = words2[1].Replace(" ", string.Empty);
				var beratDecimal = Convert.ToDecimal(berat);

				var rtsPickupFormat = new RtsPickupFormat
				{
					PickupNo = (!string.IsNullOrEmpty(consignmentRequest.Pickup.Number)) ? consignmentRequest.Pickup.Number : pickupNoFromConsole,
					AccountNo = consignmentRequest.UserId,
					ConsignmentNo = statEvent.ConsignmentNo,
					ParentConsignmentNo = string.Empty, //?
					TotalBaby = 0,
					PickupDateTime = statEvent.Date.AddHours(statEvent.Time.Hour).AddMinutes(statEvent.Time.Minute).AddSeconds(statEvent.Time.Second),
					ActualWeight = beratDecimal,
					CourierId = statEvent.CourierId,
					CourierName = string.Empty, //?
					BranchCode = statEvent.LocationId
				};
				await PostRtsPickupFormat(rtsPickupFormat, ostBaseUrl, ostClient, statusOnlyNoPost);
				if (!statusOnlyNoPost) await Task.Delay(500);
			}
		}
		consignmentRequestsIndexCount++;
	}
}

private static async Task<UserDetail> GetUserDetail(string userId, string ostBaseUrl, HttpClient ostClient)
{
	var requestUri = new Uri($"{ostBaseUrl}/api/user-details/{userId}");
	var response = await ostClient.GetAsync(requestUri);
	var output = string.Empty;

	var userDetail = new UserDetail();

	if (response.IsSuccessStatusCode)
	{
		//Console.WriteLine($"RequestUri: {requestUri.ToString()}");
		//Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
		output = await response.Content.ReadAsStringAsync();
	}
	else
	{
		Console.WriteLine($"RequestUri: {requestUri.ToString()}");
		Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
		Console.WriteLine("Aborting .....");
		return userDetail;
	}

	userDetail = JObject.Parse(output).ToJson().DeserializeFromJson<UserDetail>();
	return userDetail;
}

private static async Task<List<ConsigmentRequest>> GetConsignmentRequests(string ostBaseUrl, HttpClient ostClient)
{
	var query = $@"{{
		""filter"": {{
			""bool"": {{
            	""must"": [
					{{
						""term"": {{
                       		""Designation"": ""Contract customer""
						}}
                	}},
                	{{
                    	""term"": {{
                       		""Payment.IsConNoteReady"": true
                    	}}
                	}},
                	{{
                    	""term"": {{
                       		""Pickup.IsPickedUp"": false
                    	}}
                	}}
            	]
			}}
   		}},
   		""from"": 0,
   		""size"": 100
	}}";

	var content = new StringContent(query.ToString(), Encoding.UTF8, "application/json");
	var requestUri = new Uri($"{ostBaseUrl}/api/consigment-requests/search");
	var response = await ostClient.PostAsync(requestUri, content);
	var output = string.Empty;

	var consignmentRequests = new List<ConsigmentRequest>();

	Console.WriteLine($"RequestUri: {requestUri.ToString()}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (response.IsSuccessStatusCode)
	{
		output = await response.Content.ReadAsStringAsync();
	}
	else
	{
		Console.WriteLine("Aborting .....");
		return consignmentRequests;
	}
	var json = JObject.Parse(output).SelectToken("hits.hits");
	foreach (var jtok in json)
	{
		var consignmentRequest = jtok.SelectToken("_source").ToJson().DeserializeFromJson<ConsigmentRequest>();
		consignmentRequests.Add(consignmentRequest);
	}

	return consignmentRequests;
}

private static async Task<List<Bespoke.PosEntt.Pickups.Domain.Pickup>> GetPickupEvents(string stringOfConnotes, string rtsBaseUrl, HttpClient rtsClient)
{
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
	var requestUri = new Uri($"{rtsBaseUrl}/api/rts-dashboard/pickup");
	var response = await rtsClient.PostAsync(requestUri, content);
	var output = string.Empty;

	var pickups = new List<Bespoke.PosEntt.Pickups.Domain.Pickup>();

	Console.WriteLine($"RequestUri: {requestUri.ToString()}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (response.IsSuccessStatusCode)
	{
		output = await response.Content.ReadAsStringAsync();
	}
	else
	{
		Console.WriteLine("Aborting .....");
		return pickups;
	}
	var json = JObject.Parse(output).SelectToken("hits.hits");
	foreach (var jtok in json)
	{
		var pickup = jtok.SelectToken("_source").ToJson().DeserializeFromJson<Bespoke.PosEntt.Pickups.Domain.Pickup>();
		pickups.Add(pickup);
	}

	return pickups;
}

private static async Task<List<Bespoke.PosEntt.Stats.Domain.Stat>> GetStatEvents(string stringOfConnotes, string rtsBaseUrl, HttpClient rtsClient)
{
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
	var requestUri = new Uri($"{rtsBaseUrl}/api/rts-dashboard/stat");
	var response = await rtsClient.PostAsync(requestUri, content);
	var output = string.Empty;

	var stats = new List<Bespoke.PosEntt.Stats.Domain.Stat>();

	Console.WriteLine($"RequestUri: {requestUri.ToString()}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (response.IsSuccessStatusCode)
	{
		output = await response.Content.ReadAsStringAsync();
	}
	else
	{
		Console.WriteLine("Aborting .....");
		return stats;
	}
	var json = JObject.Parse(output).SelectToken("hits.hits");
	foreach (var jtok in json)
	{
		var stat = jtok.SelectToken("_source").ToJson().DeserializeFromJson<Bespoke.PosEntt.Stats.Domain.Stat>();
		stats.Add(stat);
	}

	return stats;
}

private static async Task PostRtsPickupFormat(RtsPickupFormat rtsPickupFormat, string ostBaseUrl, HttpClient ostClient, bool statusOnlyNoPost)
{
	Console.WriteLine($"Posting: Connote - {rtsPickupFormat.ConsignmentNo} Account - {rtsPickupFormat.AccountNo} Pickup - {rtsPickupFormat.PickupNo}");

	if (!statusOnlyNoPost)
	{
		var json = JsonConvert.SerializeObject(rtsPickupFormat);
		var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
		var requestUri = new Uri($"{ostBaseUrl}/api/rts-pickup-formats");
		var response = await ostClient.PostAsync(requestUri, content);
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
		}

		var rtsPickupFormatId = JObject.Parse(output).SelectToken("$.id").Value<string>();
		Console.WriteLine($"Posted: {rtsPickupFormatId}");
	}
}