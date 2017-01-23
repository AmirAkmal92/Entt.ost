<Query Kind="Statements">
  <Reference Relative="..\subscribers\domain.sph.dll">C:\project\work\entt.ost\subscribers\domain.sph.dll</Reference>
  <Reference Relative="..\output\Ost.AddressLookup.dll">C:\project\work\entt.ost\output\Ost.AddressLookup.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <NuGetReference>EPPlus</NuGetReference>
  <Namespace>Bespoke.Ost.AddressLookups.Domain</Namespace>
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

var postcodeFile = $@"{home}\docs\Postcode Malaysia by POS Mel latest on Sept 2016.xlsx";
if (!File.Exists(postcodeFile))
{
	Console.WriteLine(postcodeFile + " does not exist");
	return;
}



var file = new FileInfo(postcodeFile);
var excel = new ExcelPackage(file);
var ws = excel.Workbook.Worksheets["Postcode"];
if (null == ws)
	throw new ArgumentException("Cannot open Worksheet Pusat Poslaju in " + postcodeFile);



var list = new List<AddressLookup>();
var row = 2;
var location = ws.Cells["B" + row].GetValue<string>();
var postcode = ws.Cells["C" + row].GetValue<string>();
var city = ws.Cells["D" + row].GetValue<string>();
var state = ws.Cells["E" + row].GetValue<string>();
var updated = ws.Cells["F" + row].GetValue<DateTime>();

var hasRow = !string.IsNullOrEmpty(location) && !string.IsNullOrEmpty(postcode);

while (hasRow)
{
	var address = new AddressLookup
	{
		No = row.ToString(),
		Location = location,
		Postcode = postcode,
		City = city,
		State = state,
		ChangedDate = updated,
		CreatedBy = "excel",
		CreatedDate = DateTime.Today,
		ChangedBy = "excel"
	};
	list.Add(address);

	var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6MTQ4MzE0MjQwMCwic3ViIjoiMTYzNDc4OWMtODRmYi00ZmU2LWE0NDEtYzFiZjVmOWU5M2Y2IiwibmJmIjoxNDk0MTQ5MDA2LCJpYXQiOjE0Nzg1MTA2MDYsImV4cCI6MTQ4MzE0MjQwMCwiYXVkIjoiT3N0In0.YJKbH1s085G92X7fHWcd0kRHlqCUebvb1dxV6o2K0KM";
	using (var client = new HttpClient())
	{

		var request = new HttpRequestMessage(HttpMethod.Post, new Uri($"{baseUrl}/api/address-lookups"));
		var json = new StringContent(address.ToJson());
		request.Content = json;
		request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
		request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

		try
		{
			var response = client.SendAsync(request).Result;
			Console.WriteLine($"{response.StatusCode} ..... {address.Location} ..");
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex.Message);
		}

	}


	row++;
	location = ws.Cells["B" + row].GetValue<string>();
	postcode = ws.Cells["C" + row].GetValue<string>();
	city = ws.Cells["D" + row].GetValue<string>();
	state = ws.Cells["E" + row].GetValue<string>();
	updated = ws.Cells["F" + row].GetValue<DateTime>();

	hasRow = !string.IsNullOrEmpty(location) && !string.IsNullOrEmpty(postcode);


}