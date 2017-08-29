<Query Kind="Program">
  <Reference Relative="..\web\bin\domain.sph.dll">C:\project\work\entt.ost\web\bin\domain.sph.dll</Reference>
  <Reference Relative="..\web\bin\EPPlus.dll">C:\project\work\entt.ost\web\bin\EPPlus.dll</Reference>
  <Reference Relative="..\web\bin\Newtonsoft.Json.dll">C:\project\work\entt.ost\web\bin\Newtonsoft.Json.dll</Reference>
  <Reference Relative="..\output\Ost.Country.dll">C:\project\work\entt.ost\output\Ost.Country.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <Namespace>Bespoke.Ost.Countries.Domain</Namespace>
  <Namespace>Bespoke.Sph.Domain</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>OfficeOpenXml</Namespace>
  <Namespace>System.Net.Http</Namespace>
  <Namespace>System.Net.Http.Headers</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
  <Namespace>Newtonsoft.Json</Namespace>
</Query>

async Task Main()
{
	var statusOnlyNoPost = true;

	var home = System.Environment.GetEnvironmentVariable("RX_OST_HOME");
	var baseUrl = System.Environment.GetEnvironmentVariable("RX_OST_BaseUrl");
	var m_ostAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjMyNTE5NjU1NzI2ODY1MDgxYjVjOTMxIiwibmJmIjoxNTEyNzA1MjU2LCJpYXQiOjE0OTY4OTQwNTYsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.3kcLX6wuTQv30dL9sPiSfF716HUtOC_lNPPAdqjp5G8";

	//client to get existing countries
	var client = new HttpClient();
	client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

	//client to update exisitng countries (PutAsync)
	var clientToPut = new HttpClient();
	clientToPut.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", m_ostAdminToken);

	if (string.IsNullOrWhiteSpace(home) || !Directory.Exists(home))
	{
		Console.WriteLine("Run this from the command line where you have the RX_OST_* properly setup");
		return;
	}

	var postcodeFile = $@"{home}\docs\ost-country-weight-limit.xlsx";
	if (!File.Exists(postcodeFile))
	{
		Console.WriteLine(postcodeFile + " does not exist");
		return;
	}

	var file = new FileInfo(postcodeFile);
	var excel = new ExcelPackage(file);
	var ws = excel.Workbook.Worksheets["ost_country"];
	if (null == ws)
		throw new ArgumentException("Cannot open Worksheet Pusat Poslaju in " + postcodeFile);

	var row = 1;
	var _name = ws.Cells["A" + row].GetValue<string>();
	var _abbr = ws.Cells["B" + row].GetValue<string>();
	var _weight_limit = ws.Cells["C" + row].GetValue<string>();

	var hasRow = !string.IsNullOrEmpty(_name) && !string.IsNullOrEmpty(_abbr);
	var count = 0;

	while (hasRow)
	{
		//Console.WriteLine(row + ". " + _name + " [" + _abbr + "]");
		var country = new Country
		{
			Name = _name,
			Abbreviation = _abbr,
			WeightLimit = ((Convert.ToDecimal(_weight_limit)) / 1000),
			ChangedDate = DateTime.Today,
			CreatedBy = "excel",
			CreatedDate = DateTime.Today,
			ChangedBy = "excel"
		};
		//country.Dump();

		var countries = await GetCountries(baseUrl, client);
		foreach (var item in countries)
		{
			if (item.Abbreviation == country.Abbreviation && item.WeightLimit != country.WeightLimit)
			{
				item.WeightLimit = country.WeightLimit;
				count += 1;

				await PutCountries(item, baseUrl, client, statusOnlyNoPost);
			}
		}

		row++;
		_name = ws.Cells["A" + row].GetValue<string>();
		_abbr = ws.Cells["B" + row].GetValue<string>();
		_weight_limit = ws.Cells["C" + row].GetValue<string>();
		hasRow = !string.IsNullOrEmpty(_name) && !string.IsNullOrEmpty(_abbr);
	}
	count.Dump();
}

private static async Task<List<Country>> GetCountries(string baseUrl, HttpClient client)
{
	var result = new List<Country>();
	var requestUri = new Uri($"{baseUrl}/api/countries/available-country?size=300");
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
		return result;
	}
	var json = JObject.Parse(output).SelectToken("_results");
	foreach (var jtok in json)
	{
		var country = jtok.ToJson().DeserializeFromJson<Country>();
		result.Add(country);
	}
	return result;
}

private static async Task PutCountries(Country country, string baseUrl, HttpClient clientToPut, bool statusOnlyNoPost)
{
	Console.WriteLine($"Posting: Code - {country.Abbreviation} Name - {country.Name} Weight Limit - {country.WeightLimit}");

	if (!statusOnlyNoPost)
	{
		var json = JsonConvert.SerializeObject(country);
		var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
		var requestUri = new Uri($"{baseUrl}/api/countries/{country.Abbreviation}");
		var response = await clientToPut.PutAsync(requestUri, content);
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
	}
}