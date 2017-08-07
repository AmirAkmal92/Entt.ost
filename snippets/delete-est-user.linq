<Query Kind="Program">
  <Reference Relative="..\subscribers\domain.sph.dll">C:\project\work\entt.ost\subscribers\domain.sph.dll</Reference>
  <Reference Relative="..\subscribers\Newtonsoft.Json.dll">C:\project\work\entt.ost\subscribers\Newtonsoft.Json.dll</Reference>
  <Reference Relative="..\subscribers\Ost.AddressBook.dll">C:\project\work\entt.ost\subscribers\Ost.AddressBook.dll</Reference>
  <Reference Relative="..\subscribers\Ost.ConsigmentRequest.dll">C:\project\work\entt.ost\subscribers\Ost.ConsigmentRequest.dll</Reference>
  <Reference Relative="..\subscribers\Ost.UserDetail.dll">C:\project\work\entt.ost\subscribers\Ost.UserDetail.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <Namespace>Bespoke.Ost.AddressBooks.Domain</Namespace>
  <Namespace>Bespoke.Ost.UserDetails.Domain</Namespace>
  <Namespace>Bespoke.Sph.Domain</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>System.Net.Http</Namespace>
  <Namespace>System.Net.Http.Headers</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
  <Namespace>Bespoke.Ost.ConsigmentRequests.Domain</Namespace>
</Query>


async Task Main()
{
	var deleteUserAndUserData = false;
	var m_toBeDeletedUserName = "8800025410";
	var m_ostBaseUrl = "http://localhost:50230";
	var m_ostAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";

	var client = new HttpClient();
	client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

	//Delete UserDetails
	Console.WriteLine("-------------------- DELETE USER DETAIL --------------------");
	List<UserDetail> userDetails = await GetUserDetails(m_toBeDeletedUserName, m_ostBaseUrl, client);
	Console.WriteLine($"UserDetails count: {userDetails.Count} .....");
	if (deleteUserAndUserData && userDetails.Count > 0)
	{
		await DeleteUserDetails(m_ostBaseUrl, client, userDetails);
	}

	//Delete AddressBooks
	Console.WriteLine("-------------------- DELETE ADDRESS BOOK --------------------");
	List<AddressBook> addressBooks = await GetAddressBooks(m_toBeDeletedUserName, m_ostBaseUrl, client);
	Console.WriteLine($"AddressBooks count: {addressBooks.Count} .....");
	if (deleteUserAndUserData && addressBooks.Count > 0)
	{
		await DeleteAddressBooks(m_ostBaseUrl, client, addressBooks);
	}


	//Delete ConsignmentRequests
	Console.WriteLine("-------------------- DELETE CONSIGNMENT REQUEST --------------------");
	List<ConsigmentRequest> consigmentRequests = await GetConsignmentRequests(m_toBeDeletedUserName, m_ostBaseUrl, client);
	Console.WriteLine($"ConsigmentRequests count: {consigmentRequests.Count} .....");
	if (deleteUserAndUserData && consigmentRequests.Count > 0)
	{
		await DeleteConsignmentRequests(m_ostBaseUrl, client, consigmentRequests);
	}

	//Delete User
	Console.WriteLine("-------------------- DELETE USER --------------------");
	if (deleteUserAndUserData)
	{
		await DeleteUser(m_toBeDeletedUserName, m_ostBaseUrl, client);
	}
}


private static async Task<List<UserDetail>> GetUserDetails(string m_toBeDeletedUserName, string m_ostBaseUrl, HttpClient client)
{
	var query = $@"{{
    ""filter"": {{
      ""query"": {{
         ""bool"": {{
            ""must"": [
                {{
                    ""term"": {{
                       ""UserId"":""{m_toBeDeletedUserName}""
                    }}
                }}
            ]
         }}
      }}
   }},
   ""from"": 0,
   ""size"": 25
}}";

	var content = new StringContent(query.ToString(), Encoding.UTF8, "application/json");
	var requestUri = new Uri($"{m_ostBaseUrl}/api/user-details/search");
	var response = await client.PostAsync(requestUri, content);
	var output = string.Empty;

	var userDetails = new List<UserDetail>();

	Console.WriteLine($"RequestUri: {requestUri.ToString()}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (response.IsSuccessStatusCode)
	{
		output = await response.Content.ReadAsStringAsync();
	}
	else
	{
		Console.WriteLine("Aborting .....");
		return userDetails;
	}
	var json = JObject.Parse(output).SelectToken("hits.hits");
	foreach (var jtok in json)
	{
		var tmpUserDetail = jtok.SelectToken("_source").ToJson().DeserializeFromJson<UserDetail>();
		userDetails.Add(tmpUserDetail);
	}

	return userDetails;
}

private static async Task DeleteUserDetails(string m_ostBaseUrl, HttpClient client, List<UserDetail> userDetails)
{
	foreach (var userDetail in userDetails)
	{
		var requestUri = new Uri($"{m_ostBaseUrl}/api/user-details/{userDetail.Id}");
		var response = await client.DeleteAsync(requestUri);
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
			return;
		}
		output.Dump();
	}
}

private static async Task<List<AddressBook>> GetAddressBooks(string m_toBeDeletedUserName, string m_ostBaseUrl, HttpClient client)
{
	var query = $@"{{
    ""filter"": {{
      ""query"": {{
         ""bool"": {{
            ""must"": [
                {{
                    ""term"": {{
                       ""CreatedBy"":""{m_toBeDeletedUserName}""
                    }}
                }}
            ]
         }}
      }}
   }},
   ""from"": 0,
   ""size"": 250
}}";

	var content = new StringContent(query.ToString(), Encoding.UTF8, "application/json");
	var requestUri = new Uri($"{m_ostBaseUrl}/api/address-books/search");
	var response = await client.PostAsync(requestUri, content);
	var output = string.Empty;

	var addressBooks = new List<AddressBook>();

	Console.WriteLine($"RequestUri: {requestUri.ToString()}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (response.IsSuccessStatusCode)
	{
		output = await response.Content.ReadAsStringAsync();
	}
	else
	{
		Console.WriteLine("Aborting .....");
		return addressBooks;
	}
	var json = JObject.Parse(output).SelectToken("hits.hits");
	foreach (var jtok in json)
	{
		var tmpAddressBook = jtok.SelectToken("_source").ToJson().DeserializeFromJson<AddressBook>();
		addressBooks.Add(tmpAddressBook);
	}

	return addressBooks;
}

private static async Task DeleteAddressBooks(string m_ostBaseUrl, HttpClient client, List<AddressBook> addressBooks)
{
	foreach (var addressBook in addressBooks)
	{
		var requestUri = new Uri($"{m_ostBaseUrl}/api/address-books/{addressBook.Id}");
		var response = await client.DeleteAsync(requestUri);
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
			return;
		}
		output.Dump();
	}
}

private static async Task<List<ConsigmentRequest>> GetConsignmentRequests(string m_toBeDeletedUserName, string m_ostBaseUrl, HttpClient client)
{
	var query = $@"{{
    ""filter"": {{
      ""query"": {{
         ""bool"": {{
            ""must"": [
                {{
                    ""term"": {{
                       ""UserId"":""{m_toBeDeletedUserName}""
                    }}
                }}
            ]
         }}
      }}
   }},
   ""from"": 0,
   ""size"": 250
}}";

	var content = new StringContent(query.ToString(), Encoding.UTF8, "application/json");
	var requestUri = new Uri($"{m_ostBaseUrl}/api/consigment-requests/search");
	var response = await client.PostAsync(requestUri, content);
	var output = string.Empty;

	var consigmentRequests = new List<ConsigmentRequest>();

	Console.WriteLine($"RequestUri: {requestUri.ToString()}");
	Console.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase.ToString()}");
	if (response.IsSuccessStatusCode)
	{
		output = await response.Content.ReadAsStringAsync();
	}
	else
	{
		Console.WriteLine("Aborting .....");
		return consigmentRequests;
	}
	var json = JObject.Parse(output).SelectToken("hits.hits");
	foreach (var jtok in json)
	{
		var tmpConsigmentRequest = jtok.SelectToken("_source").ToJson().DeserializeFromJson<ConsigmentRequest>();
		consigmentRequests.Add(tmpConsigmentRequest);
	}

	return consigmentRequests;
}

private static async Task DeleteConsignmentRequests(string m_ostBaseUrl, HttpClient client, List<ConsigmentRequest> consignmentRequests)
{
	foreach (var consignmentRequest in consignmentRequests)
	{
		var requestUri = new Uri($"{m_ostBaseUrl}/api/consigment-requests/{consignmentRequest.Id}");
		var response = await client.DeleteAsync(requestUri);
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
			return;
		}
		output.Dump();
	}
}

private static async Task DeleteUser(string m_toBeDeletedUserName, string m_ostBaseUrl, HttpClient client)
{
	var requestUri = new Uri($"{m_ostBaseUrl}/admin/RemoveUser/{m_toBeDeletedUserName}");
	var response = await client.DeleteAsync(requestUri);
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
		return;
	}
	output.Dump();
}


