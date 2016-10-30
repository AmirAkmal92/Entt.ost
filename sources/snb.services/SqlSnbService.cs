﻿using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Dapper;

namespace Bespoke.PostEntt.Ost.Services
{
    public class SqlSnbService : ISnbService
    {
        
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
            // ReSharper restore UnusedAutoPropertyAccessor.Local
            // ReSharper restore UnusedMember.Local
        }


        public async Task<IEnumerable<Product>> GetProductAsync()
        {
            var sql = "SELECT * FROM [dbo].[Product] WHERE [SbuName] = \'PosLaju\' AND [Status] <> 2 AND [ValidFrom] <= GETDATE() AND [ValidTo] >= GETDATE()";
            using (var conn = new SqlConnection(ConnectionString))
            {
                await conn.OpenAsync();
                var list = await conn.QueryAsync<Product>(sql);
                // TODO : read the value add services
                var vas = (await conn.QueryAsync<SnbValuedAddedService>("SELECT * FROM [dbo].[ValueAddedService] WHERE [SbuName] = 'PosLaju' AND [ValidFrom] <= GETDATE() AND [ValidTo] >= GETDATE()")).ToList();
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

        public async Task<decimal?> CalculateValueAddedServiceAsync(Product product, ValueAddedService vas)
        {

            await Task.Delay(2000);
            if (string.IsNullOrWhiteSpace(vas.Formula))
                return new Random(DateTime.Now.Second).Next(DateTime.Now.Millisecond);
            return vas.Formula.Length + DateTime.Now.Second;
        }
    }
}