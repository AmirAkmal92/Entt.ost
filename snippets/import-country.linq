<Query Kind="Statements">
  <Reference Relative="..\subscribers\domain.sph.dll">C:\project\work\entt.ost\subscribers\domain.sph.dll</Reference>
  <Reference Relative="..\output\Ost.Country.dll">C:\project\work\entt.ost\output\Ost.Country.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <NuGetReference>EPPlus</NuGetReference>
  <Namespace>Bespoke.Ost.Countries.Domain</Namespace>
  <Namespace>Bespoke.Sph.Domain</Namespace>
  <Namespace>OfficeOpenXml</Namespace>
  <Namespace>System.Net.Http</Namespace>
</Query>

var home = System.Environment.GetEnvironmentVariable("RX_OST_HOME");
var baseUrl = System.Environment.GetEnvironmentVariable("RX_OST_BaseUrl");

if (string.IsNullOrWhiteSpace(home) || !Directory.Exists(home))
{
	Console.WriteLine("Run this from the command line where you have the RX_OST_* properly setup");
	return;
}

var postcodeFile = $@"{home}\docs\ost-country.xlsx";
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
var _guid = ws.Cells["A" + row].GetValue<string>();
var _abbr = ws.Cells["B" + row].GetValue<string>();
var _name = ws.Cells["C" + row].GetValue<string>();

var hasRow = !string.IsNullOrEmpty(_name) && !string.IsNullOrEmpty(_abbr);

while (hasRow)
{
	//Console.WriteLine(row + ". " + _name + " [" + _abbr + "]");
	var country = new Country {
		Name = _name,
		Abbreviation = _abbr,
		ChangedDate = DateTime.Today,
		CreatedBy = "excel",
		CreatedDate = DateTime.Today,
		ChangedBy = "excel"
	};
	//country.Dump();

	var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk";
	using (var client = new HttpClient())
	{	
		var request = new HttpRequestMessage(HttpMethod.Post, new Uri($"{baseUrl}/api/countries"));
		var json = new StringContent(country.ToJson());
		request.Content = json;
		request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
		request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
	
		try
		{
			var response = client.SendAsync(request).Result;
			Console.WriteLine($"{response.StatusCode} ..... {country.Name} ..");
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex.Message);
		}	
	}

	row++;
	_abbr = ws.Cells["B" + row].GetValue<string>();
	_name = ws.Cells["C" + row].GetValue<string>();	
	hasRow = !string.IsNullOrEmpty(_name) && !string.IsNullOrEmpty(_abbr);
}