<Query Kind="Statements">
  <Reference Relative="..\subscribers\domain.sph.dll">F:\project\work\entt.ost\subscribers\domain.sph.dll</Reference>
  <Reference Relative="..\output\Ost.PosLajuBranch.dll">F:\project\work\entt.ost\output\Ost.PosLajuBranch.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <NuGetReference>EPPlus</NuGetReference>
  <Namespace>Bespoke.Ost.PosLajuBranchBranches.Domain</Namespace>
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

var postcodeFile = $@"{home}\docs\Poscode New.new.xlsx";
if (!File.Exists(postcodeFile))
{
	Console.WriteLine(postcodeFile + " does not exist");
	return;
}



var file = new FileInfo(postcodeFile);
var excel = new ExcelPackage(file);
var ws = excel.Workbook.Worksheets["Pusat Poslaju"];
if (null == ws)
	throw new ArgumentException("Cannot open Worksheet Pusat Poslaju in " + postcodeFile);



var postOffices = new List<PosLajuBranch>();
var row = 2;
var id = ws.Cells["B" + row].GetValue<string>();
var code = ws.Cells["F" + row].GetValue<string>();
var name = ws.Cells["E" + row].GetValue<string>();
var @from = ws.Cells["C" + row].GetValue<string>();
var @to = ws.Cells["D" + row].GetValue<string>();
var email = ws.Cells["G" + row].GetValue<string>();
var hasRow = !string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(name);

var duplicateEmails = new List<string>();


while (hasRow)
{
	var branch = new PosLajuBranch
	{
		PickupId = id,
		BranchCode = code,
		Name = name,
		PostcodeFrom = @from,
		PostcodeTo = @to,
		CreatedBy = "excel",
		CreatedDate = DateTime.Today,
		ChangedBy = "excel",
		ChangedDate = DateTime.Today,
		Email = email
	};
	postOffices.Add(branch);

	var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6MTQ4MzE0MjQwMCwic3ViIjoiODg4YWM5ZWItMjI2OS00MzY0LTgyODAtNmU0NzkyZWI0MTI0IiwibmJmIjoxNDkzNzc5NTQ4LCJpYXQiOjE0NzgxNDExNDgsImV4cCI6MTQ4MzE0MjQwMCwiYXVkIjoiT3N0In0.gyCkviRkhtQOmsUMcOeQWf0MxdjR_qZJ7Mks9NpWK0I";
	using (var client = new HttpClient())
	{

		var request = new HttpRequestMessage(HttpMethod.Post, new Uri($"{baseUrl}/api/pos-laju-branches"));
		var json = new StringContent(branch.ToJson());
		request.Content = json;
		request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
		request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

		try
		{
			var response = client.SendAsync(request).Result;
			Console.WriteLine($"{response.StatusCode} ..... {branch.Name} ..");
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex.Message);
		}

	}


	row++;
	code = ws.Cells["F" + row].GetValue<string>();
	name = ws.Cells["E" + row].GetValue<string>();
	@from = ws.Cells["C" + row].GetValue<string>();
	@to = ws.Cells["D" + row].GetValue<string>();
	email = ws.Cells["G" + row].GetValue<string>();
	id = ws.Cells["B" + row].GetValue<string>();
	hasRow = !string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(name);
	
	
}

//postOffices.Dump();

