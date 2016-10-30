using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Newtonsoft.Json;

namespace Bespoke.PostEntt.Ost.Services
{
    [DebuggerDisplay("{Code}:{Name}")]
    public class ValueAddService
    {
        public ValueAddService()
        {

        }

        public ValueAddService(ProductValueAddedService snbVas)
        {
            this.Code = snbVas.Code;
            this.Name = snbVas.Name;
        }
        public string Code { get; set; }
        public string Name { get; set; }
        public decimal Value { get; set; }
        public bool IsSelected { get; set; }
        public bool? IsGst { get; set; }
        public string Formula { get; set; }
        public int? FormulaPosition { get; set; }
        public IList<UserInput> UserInputs { get; } = new List<UserInput>();
    }

    [DebuggerDisplay("{Code}:{Name}")]
    public class Surcharge
    {

        public Surcharge()
        {

        }

        public Surcharge(ProductSurcharge snbSurcharge)
        {
            this.Code = snbSurcharge.Code;
        }
        public string Code { get; set; }
        public string Name { get; set; }
        public decimal Value { get; set; }
        public bool IsSelected { get; set; }
        public bool IsMandatory { get; set; }
        public bool? IsGst { get; set; }
        public string Formula { get; set; }
        public int? FormulaPosition { get; set; }
    }


    [DebuggerDisplay("{Code}:{Name}")]
    public class ProductValueAddedService
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
    }

    [DebuggerDisplay("{Name}:{Value}")]
    public class UserInput
    {
        public string Name { get; set; }
        public decimal? Value { get; set; }
    }

    [DebuggerDisplay("{Code}:{Name}")]
    public class ProductSurcharge
    {
        public Guid Id { get; set; }

        public string Code { get; set; }
        public string Name { get; set; }
        // ReSharper disable InconsistentNaming
        public bool IsGST { get; set; }
        // ReSharper restore InconsistentNaming
    }

    public enum ProductType
    {
        Specialty,
        NonSpecialty
    }

    public enum ScaleType
    {
        WeightScale,
        Descriptive
    }

    [DebuggerDisplay("{Code}:{Name}")]
    public class Product
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public string Parent { get; set; }
        public string Description { get; set; }
        public string PreferredLane { get; set; }
        public string Sbu { get; set; }
        public ProductType Type { get; set; }
        public ScaleType ScaleType { get; set; }
        public bool IsInternational { get; set; }
        public string GstCode { get; set; }
        public string Sla { get; set; }

        public IList<Surcharge> Surcharges { get; } = new List<Surcharge>();
        public IList<ValueAddService> ValueAddServices { get; } = new List<ValueAddService>();

        public void Initialize()
        {
            if (!string.IsNullOrWhiteSpace(this.SerializedValueAddedServices))
            {
                //[{__type:"SalesBilling.Domain.Entities.Pricing.Events.ProductValueAddedService, SalesBilling.Domain",
                // Id:9daf7d82d9f5430a8404fa6ad3aa342d,Code:V01,Name:Insurance PosLaju-Normal },{Id:8592197ef16248818fa597da785d52a5,Code:V02,Name:Insurance PosLaju-High},{Id:3ce7fcd251fe4bc48d883c932eb89c19,Code:V03,Name:TCS Domestic},{Id:969a101b4c8b43809da6cd1ea734151a,Code:V04,Name:TCS Tokyo},{Id:0b667f794a614c239d90b93af0085b44,Code:V05,Name:VIP},{Id:7b2bccf2fd6b4790afbfd1156f480467,Code:V08,Name:Insurance Parcel},{Id:6d1cfed69eb64a4a85a3eab3c5ce1f31,Code:V10,Name:Packaging Services International},{Id:99f06302599f4a9d979ada58825a91ff,Code:V11,Name:Perkhidmatan Pick-Up},{Id:ba34a380e84d4308a89988374eca34d2,Code:V12,Name:A},{Id:8591ead5ecc94a978f21a915fa85376a,Code:V16,Name:Services 1}]
                var text = this.SerializedValueAddedServices.Replace("SalesBilling.Domain.Entities.Pricing.Events.ProductValueAddedService, SalesBilling.Domain", "Bespoke.PostEntt.Ost.Services.ProductValueAddedService, snb.services");

                var list = ServiceStack.Text.TypeSerializer.DeserializeFromString<List<ProductValueAddedService>>(text);
                this.ValueAddServices.AddRange(list.Select(x => new ValueAddService(x)));
            }

            if (!string.IsNullOrWhiteSpace(this.SerializedSurcharges))
            {
                //[{__type:"SalesBilling.Domain.Entities.Pricing.Events.ProductSurcharge, SalesBilling.Domain",Id:9a7b765175e342f4a7c5246190b4f0ec,Code:S01,Name:Domestic GST,IsGST:False}]
                var text = this.SerializedSurcharges.Replace("SalesBilling.Domain.Entities.Pricing.Events.ProductSurcharge, SalesBilling.Domain", "Bespoke.PostEntt.Ost.Services.ProductSurcharge, snb.services");
                var list = ServiceStack.Text.TypeSerializer.DeserializeFromString<List<ProductSurcharge>>(text);
                this.Surcharges.AddRange(list.Select(x => new Surcharge(x)));
            }

        }

        [JsonIgnore]
        public string SerializedInputConstraints { get; set; }
        [JsonIgnore]
        public string SerializedItemCategories { get; set; }
        [JsonIgnore]
        public string SerializedSurcharges { get; set; }
        [JsonIgnore]
        public string SerializedValueAddedServices { get; set; }
    }
}