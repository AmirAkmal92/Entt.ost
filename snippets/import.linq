<Query Kind="Program">
  <Connection>
    <ID>36acb0ef-be1c-49b5-b23e-48c5db05237b</ID>
    <Persist>true</Persist>
    <Server>S301\DEV2016</Server>
    <Database>SnBReadProd</Database>
  </Connection>
  <Reference Relative="..\subscribers.host\domain.sph.dll">F:\project\work\entt.ost\subscribers.host\domain.sph.dll</Reference>
  <Reference Relative="..\subscribers.host\Newtonsoft.Json.dll">F:\project\work\entt.ost\subscribers.host\Newtonsoft.Json.dll</Reference>
  <Reference Relative="..\output\Ost.AddressBook.dll">F:\project\work\entt.ost\output\Ost.AddressBook.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Net.Http.dll</Reference>
  <Namespace>Bespoke.Sph.Domain</Namespace>
  <Namespace>System.Net.Http</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
  <Namespace>System.Net</Namespace>
</Query>

void Main()
{
	var files = Directory.GetFiles(@"E:\temp\lhdn\12", "*.txt", SearchOption.AllDirectories);
	foreach (var txt in files)
	{
		DoWork(txt).Wait();
	}
	Console.WriteLine("Done");

}


// Define other methods and classes here

private async static Task DoWork(string lhdn)
{
	var lines = File.ReadLines(lhdn);
	var contacts = new List<Bespoke.Ost.AddressBooks.Domain.AddressBook>();
	var count = 0;
	foreach (var l in lines)
	{
		count++;
		var contact = new Bespoke.Ost.AddressBooks.Domain.AddressBook
		{
			ReferenceNo = l.Read(138, 151),
			CompanyName = l.Read(741, 802),
			ContactPerson = l.Read(73, 134),
			Address = new Bespoke.Ost.AddressBooks.Domain.Address
			{
				PremiseNoMailbox = l.Read(226, 265),
				RoadName = l.Read(266, 307),
				AreaVillageGardenName = l.Read(307, 347),
				City = l.Read(346, 377),
				State = l.Read(386, 417),
				Postcode = l.Read(376, 382),
				Country = "Malaysia"
			},
			ContactInformation = new Bespoke.Ost.AddressBooks.Domain.ContactInformation
			{
				EmailAddress = l.Read(1237, 1270).Trim(),
				PhoneNumber = l.Read(880, 920)
			}

		};
		contact.Groups.Add(l.GuessGender());
		contact.Groups.Add(l.GuessRace());
		contact.Groups.Add(l.GuessReligion());

		contacts.Add(contact);
		// do it batch of 50
		if (contacts.Count > 50)
		{
			/**/
			await RegisterAll(contacts);
			contacts.Clear();
		}

	}
	// the last bit
	/**/
	await RegisterAll(contacts);
	contacts.Clear();
	Console.WriteLine("Done with " + lhdn);
}

private static async Task RegisterAll(List<Bespoke.Ost.AddressBooks.Domain.AddressBook> patients)
{
	var tasks = from p in patients
				select Register(p);
	await Task.WhenAll(tasks);
}
private static async Task Register(Bespoke.Ost.AddressBooks.Domain.AddressBook contact)
{
	var token = @"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoib3NtYW4iLCJyb2xlcyI6WyJjdXN0b21lciIsImN1c3RvbWVycyJdLCJlbWFpbCI6MTQ4MzE0MjQwMCwic3ViIjoiMDQ1NmRmNDAtNjllZS00ZDRmLTgyYmMtZWMzYzg2YzY2N2Q4IiwibmJmIjoxNDkzNTE3OTYxLCJpYXQiOjE0Nzc4Nzk1NjEsImV4cCI6MTQ4MzE0MjQwMCwiYXVkIjoiT3N0In0.O_23hvYF9K-8jBB_53TTkp6u_8Lw0-0TQx7mwdi21Ho";

	using (var client = new HttpClient())
	{

		contact.Groups.Add("Snb");
		var request = new HttpRequestMessage(HttpMethod.Post, new Uri("http://localhost:50430/api/address-books"));
		var json = new StringContent(contact.ToJson());
		request.Content = json;
		request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
		request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

		try
		{

			var response = await client.SendAsync(request);
			Console.Write(".");
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex.Message);
		}

	}

}

// Define other methods and classes here
public static class StringExtensions
{
	public static string Read(this string line, int startIndex, int endIndex)
	{
		if (line.Length < endIndex - 1) return string.Empty;
		return line.Substring(startIndex, endIndex - 1 - startIndex).TrimEnd();
	}

	public static string GuessReligion(this string line)
	{
		var name = line.Read(73, 134);
		if (name.Contains(" BIN ")) return "Islam";
		if (name.Contains(" BINTI ")) return "Islam";
		if (name.Contains(" B. ")) return "Islam";
		if (name.Contains(" BT. ")) return "Islam";
		if (name.Contains(" B ")) return "Islam";
		if (name.Contains(" BT ")) return "Islam";
		if (name.Contains(" A/L ")) return "Hinduism";
		if (name.Contains(" A/P ")) return "Hinduism";


		return "Others";
	}


	public static string GuessGender(this string line)
	{
		var name = line.Read(73, 134);
		if (name.Contains(" BIN ")) return "Male";
		if (name.Contains(" BINTI ")) return "Female";
		if (name.Contains(" B. ")) return "Male";
		if (name.Contains(" BT. ")) return "Female";
		if (name.Contains(" B ")) return "Male";
		if (name.Contains(" BT ")) return "Female";
		if (name.Contains(" A/L ")) return "Male";
		if (name.Contains(" A/P ")) return "Female";

		var id = line.Read(138, 151).ToCharArray().LastOrDefault();
		int lastid;
		if (int.TryParse(string.Format("{0}", id), out lastid))
		{
			return lastid % 2 == 0 ? "Female" : "Male";
		}

		return "Others";
	}



	public static string GuessRace(this string line)
	{
		var name = line.Read(73, 134);
		if (name.Contains(" BIN ")) return "Malay";
		if (name.Contains(" BINTI ")) return "Malay";
		if (name.Contains(" B. ")) return "Malay";
		if (name.Contains(" BT. ")) return "Malay";
		if (name.Contains(" B ")) return "Malay";
		if (name.Contains(" BT ")) return "Malay";
		if (name.Contains(" A/L ")) return "Indian";
		if (name.Contains(" A/P ")) return "Indian";
		int count = name.Split(' ').Length;
		if (count == 3) return "Chinese";

		return "Others";
	}
}