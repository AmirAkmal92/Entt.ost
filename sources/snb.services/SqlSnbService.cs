using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using Newtonsoft.Json.Linq;

namespace Bespoke.PostEntt.Ost.Services
{
    public class SqlSnbService : ISnbService
    {
        private HttpClient m_snbWebAppClient;
        public SqlSnbService()
        {
            m_snbWebAppClient = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("SnbWebApp")) };
        }
        // ReSharper disable once ClassNeverInstantiated.Local
        [DebuggerDisplay("{Code}:{Name}")]
        private class SnbSurcharge
        {
            // ReSharper disable UnusedMember.Local
            // ReSharper disable UnusedAutoPropertyAccessor.Local

            public Guid Id { get; set; }
            public string SerializedUserInputs { get; set; }
            public string Name { get; set; }
            public string Code { get; set; }
            public string PrsCode { get; set; }
            public DateTime? ValidFrom { get; set; }
            public DateTime? ValidTo { get; set; }
            public bool? IsLocked { get; set; }
            public int? FormulaPosition { get; set; }
            public string Formula { get; set; }
            public Guid GeneralLedgerId { get; set; }
            public string GeneralLedgerCode { get; set; }
            public Guid SbuId { get; set; }
            public string SbuName { get; set; }
            public DateTime? CreatedOn { get; set; }
            public Guid CreatedById { get; set; }
            public string CreatedByName { get; set; }
            public bool? IsSpecial { get; set; }
            public string GeneralLedgerName { get; set; }
            public string GstCode { get; set; }
            public bool? IsGst { get; set; }


        }

        // ReSharper disable once ClassNeverInstantiated.Local
        [DebuggerDisplay("{Code}:{Name}")]
        private class SnbValuedAddedService
        {
            public string SerializedUserInputs { get; set; }
            public string Name { get; set; }
            public string Code { get; set; }
            public string PrsCode { get; set; }
            public DateTime? ValidFrom { get; set; }
            public DateTime? ValidTo { get; set; }
            public bool? IsLocked { get; set; }
            public int? FormulaPosition { get; set; }
            public string Formula { get; set; }
            public Guid GeneralLedgerId { get; set; }
            public string GeneralLedgerCode { get; set; }
            public Guid SbuId { get; set; }
            public string SbuName { get; set; }
            public DateTime? CreatedOn { get; set; }
            public Guid? CreatedById { get; set; }
            public string CreatedByName { get; set; }
            public bool? IsSpecial { get; set; }
            public string GeneralLedgerName { get; set; }
            public string GstCode { get; set; }
            public bool? IsGst { get; set; }
        }
        // ReSharper disable once ClassNeverInstantiated.Local
        private class SnbItemCategory
        {
            public Guid Id { get; set; }
            public string PrsCode { get; set; }

        }
        // ReSharper restore UnusedAutoPropertyAccessor.Local
        // ReSharper restore UnusedMember.Local


        public async Task<IEnumerable<Product>> GetProductAsync(SuggestProductModel model, IValueAddedServicesRules rules)
        {
            var international = (model.Country == "MY" || model.Country == "Malaysia") ? "0" : "1";
            string sql = $@"
SELECT 
    * 
FROM 
    [dbo].[Product] 
WHERE 
    [Ost] = 1
AND 
    [Status] <> 2 
AND 
    [ValidFrom] <= GETDATE() 
AND 
    [ValidTo] >= GETDATE() 
AND 
    [IsInternational] = {international}
AND
    [MinWeight] <= {model.Weight}
AND
    [MaxWeight] >= {model.Weight}";
            using (var conn = new SqlConnection(ConnectionString))
            {
                await conn.OpenAsync();
                var list = await conn.QueryAsync<Product>(sql);
                // TODO : read the value add services
                var vas = (await conn.QueryAsync<SnbValuedAddedService>("SELECT * FROM [dbo].[ValueAddedService] WHERE [Ost] = 1 AND [ValidFrom] <= GETDATE() AND [ValidTo] >= GETDATE()")).ToList();
                var surcharges = (await conn.QueryAsync<SnbSurcharge>("SELECT * FROM [dbo].[Surcharge] WHERE [SbuName] = 'PosLaju' AND [ValidFrom] <= GETDATE() AND [ValidTo] >= GETDATE()")).ToList();


                var products = new List<Product>();
                foreach (var product in list)
                {
                    product.Initialize();
                    var validServices = new List<ValueAddedService>();
                    foreach (var v in product.ValueAddedServices)
                    {
                        var db = vas.SingleOrDefault(x => x.Code == v.Code);
                        if (null == db) continue;
                        //v.Value = db.Value;
                        v.Name = db.Name;
                        v.IsGst = db.IsGst;
                        v.Formula = db.Formula;
                        v.FormulaPosition = db.FormulaPosition;
                        //[{__type:"SalesBilling.Domain.Entities.Pricing.UserInput, SalesBilling.Domain",Name:DECLARED_VALUE,Value:0.0}]
                        var text = db.SerializedUserInputs.Replace("SalesBilling.Domain.Entities.Pricing.UserInput, SalesBilling.Domain", "Bespoke.PostEntt.Ost.Services.UserInput, snb.services");
                        var userInputs = ServiceStack.Text.TypeSerializer.DeserializeFromString<List<UserInput>>(text);
                        v.UserInputs.AddRange(userInputs);

                        var valid = await rules.Validate(model, product, v);
                        if (valid)
                            validServices.Add(v);
                    }
                    product.ValueAddedServices.Clear();
                    product.ValueAddedServices.AddRange(validServices);

                    var validSurcharges = new List<Surcharge>();
                    foreach (var sc in product.Surcharges)
                    {
                        var db = surcharges.SingleOrDefault(x => x.Code == sc.Code);
                        if (null == db) continue;
                        //v.Value = db.Value;
                        sc.Name = db.Name;
                        sc.IsGst = db.IsGst;
                        sc.Formula = db.Formula;
                        sc.FormulaPosition = db.FormulaPosition;
                        validSurcharges.Add(sc);
                    }
                    product.Surcharges.Clear();
                    product.Surcharges.AddRange(validSurcharges);


                    products.Add(product);
                }
                return products;
            }
        }

        public async Task<IEnumerable<string>> GetItemCategoriesAsync()
        {
            var sql = "SELECT [Name] FROM [dbo].[ItemCategory]";
            using (var conn = new SqlConnection(ConnectionString))
            {
                await conn.OpenAsync();
                return await conn.QueryAsync<string>(sql);
            }
        }

        public string ConnectionString => ConfigurationManager.GetEnvironmentVariable("SnbReadSqlConnectionString") ?? @"Data Source=S301\DEV2016;Initial Catalog=SnBReadProd;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False";

        public Task<decimal> CalculateRate(string code, decimal? weight, decimal? length, decimal? width, decimal? height)
        {
            return Task.FromResult((weight ?? 1.0m) * (length ?? 1.01m) * (width ?? 1.03m));
        }

        public async Task<decimal?> CalculateValueAddedServiceAsync(QuotationRequest request, Product product, ValueAddedService vas)
        {

            var userInputs = string.Join("\r\n", vas.UserInputs.Select(x => $"public const decimal {x.Name} = {x.Value}m;"));
            var options = ScriptOptions.Default
                .WithImports("System")
                .WithImports("System.Math");

            var script = CSharpScript
                .Create<decimal>($@"
using System;
public class CalcHost
{{
    const string ITEM_CATEGORY_NAME = ""{request.ItemCategory}"";
    const bool IS_INTERNATIONAL = {(request.ReceiverCountry != "MY" ? "true" : "false")};
    {userInputs}
    // TODO : like BASE_RATE and stuff
    public decimal Evaluate()
    {{
        {vas.Formula}    
    }}
}}

").ContinueWith(@"
    var calc = new CalcHost();    
").ContinueWith(@"
    return calc.Evaluate();
").WithOptions(options);

            var result = await script.RunAsync();
            return (decimal?)result.ReturnValue;
        }


        public async Task<PublishedRate> CalculatePublishedRateAsync(QuotationRequest request, Product product, IEnumerable<ValueAddedService> valueAddedServices)
        {
            var url = new StringBuilder();

            if (request.ReceiverCountry == "MY" || request.ReceiverCountry == "Malaysia")
            {
                request.ItemCategory = request.Weight < 2.01m ? "Document" : "Merchandise";
            }

            url.Append("/calculator/CalculateRate2");
            url.Append($"?ProductCode={product.Code}");
            url.Append($"&SenderPostCode={request.SenderPostcode}&SenderCountryCode=MY&ReceiverPostCode={request.ReceiverPostcode}&ReceiverCountryCode={request.ReceiverCountry}");
            url.Append($"&ItemCategoryName={request.ItemCategory}");
            url.Append($"&ActualWeight={request.Weight}&Width={request.Width}&Height={request.Height}&Length={request.Length}");
            url.Append($"&surcharge_S01=S01&surcharge_S03=S03&surcharge_S05=S05"); // 3 surcharge wajib
            
            foreach (var v in valueAddedServices)
            {
                url.Append($"&vas_{v.Code}={v.Code}");
                foreach (var p in v.UserInputs)
                {
                    url.Append($"&{v.Code}_{p.Name}={p.Value}");
                }
            }

            var response = await m_snbWebAppClient.GetStringAsync(url.ToString());
            var json = JObject.Parse(response);

            var rate = new PublishedRate(json);
            return rate;
        }
    }
}