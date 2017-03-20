using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace Bespoke.PostEntt.Ost.Services
{
    public class AddOn
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Formula { get; set; }
        public decimal Charge { get; set; }
    }


    public class PublishedRate
    {
        public PublishedRate(JObject json)
        {
            this.RateStepInfo = json.SelectToken("$.RateStepInfo").Value<string>();
            this.BaseRate = json.SelectToken("$.BaseRate").Value<decimal>();
            this.SubTotal1 = json.SelectToken("$.SubTotal1").Value<decimal>();
            this.SubTotal2 = json.SelectToken("$.SubTotal2").Value<decimal>();
            this.SubTotal3 = json.SelectToken("$.SubTotal3").Value<decimal>();
            this.TotalBeforeDiscount = json.SelectToken("$.TotalBeforeDiscount").Value<decimal>();
            this.Total = json.SelectToken("$.Total").Value<decimal>();
            this.TaxRemark = json.SelectToken("$.TaxRemark").Value<string>();
            this.Length = json.SelectToken("$.FormulaArguments.LENGTH").Value<decimal>();
            this.Width = json.SelectToken("$.FormulaArguments.WIDTH").Value<decimal>();
            this.Height = json.SelectToken("$.FormulaArguments.HEIGHT").Value<decimal>();
            this.ActualWeight = json.SelectToken("$.FormulaArguments.ACTUAL_WEIGHT").Value<decimal>();
            this.VolumetricWeight = json.SelectToken("$.FormulaArguments.VOLUMETRIC_WEIGHT").Value<decimal>();
            this.BranchCode = json.SelectToken("$.FormulaArguments.BRANCH_CODE").Value<string>();
            this.SenderPostcode = json.SelectToken("$.FormulaArguments.SENDER_POSTCODE").Value<string>();
            this.SenderCountryCode = json.SelectToken("$.FormulaArguments.SENDER_COUNTRY_CODE").Value<string>();
            this.ReceiverPostcode = json.SelectToken("$.FormulaArguments.RECEIVER_POSTCODE").Value<string>();
            this.ReceiverCountryCode = json.SelectToken("$.FormulaArguments.RECEIVER_COUNTRY_CODE").Value<string>();
            this.ZoneName = json.SelectToken("$.FormulaArguments.ZONE_NAME").Value<string>();

            if (json["AddOns_A"].HasValues)
            {
                IEnumerable<AddOn> addOns = PopulateAddOns(json["AddOns_A"]);
                foreach (var addOn in addOns)
                {
                    this.AddOnsA.Add(addOn);
                }
            }
            if (json["AddOns_B"].HasValues)
            {
                IEnumerable<AddOn> addOns = PopulateAddOns(json["AddOns_B"]);
                foreach (var addOn in addOns)
                {
                    this.AddOnsB.Add(addOn);
                }
            }
            if (json["AddOns_C"].HasValues)
            {
                IEnumerable<AddOn> addOns = PopulateAddOns(json["AddOns_C"]);
                foreach (var addOn in addOns)
                {
                    this.AddOnsC.Add(addOn);
                }
            }
            if (json["AddOns_D"].HasValues)
            {
                IEnumerable<AddOn> addOns = PopulateAddOns(json["AddOns_D"]);
                foreach (var addOn in addOns)
                {
                    this.AddOnsD.Add(addOn);
                }
            }

        }

        private static IEnumerable<AddOn> PopulateAddOns(JToken jtok)
        {
            return from j in jtok
                   select new AddOn
                   {
                       Code = (string)j["Code"],
                       Name = (string)j["Name"],
                       Formula = (string)j["Formula"],
                       Charge = (decimal)j["Charge"]
                   };
        }

        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string RateStepInfo { get; set; }
        public string ItemCategory { get; set; }
        public decimal BaseRate { get; set; }
        public IList<AddOn> AddOnsA { get; } = new List<AddOn>();
        public decimal SubTotal1 { get; set; }
        public IList<AddOn> AddOnsB { get; } = new List<AddOn>();
        public decimal SubTotal2 { get; set; }
        public IList<AddOn> AddOnsC { get; } = new List<AddOn>();
        public decimal SubTotal3 { get; set; }
        public IList<AddOn> AddOnsD { get; } = new List<AddOn>();
        public decimal TotalBeforeDiscount { get; set; }
        public decimal Total { get; set; }
        public string TaxRemark { get; set; }
        public List<object> Discounts { get; set; }
        public decimal Length { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal ActualWeight { get; set; }
        public decimal VolumetricWeight { get; set; }
        public string BranchCode { get; set; }
        public string SenderPostcode { get; set; }
        public string SenderCountryCode { get; set; }
        public string ReceiverPostcode { get; set; }
        public string ReceiverCountryCode { get; set; }
        public string ZoneName { get; set; }
    }

}
