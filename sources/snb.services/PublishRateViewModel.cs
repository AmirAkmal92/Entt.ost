using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Bespoke.PostEntt.Ost.Services
{
    public class AddOn
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public bool IsInclusive { get; set; }
        public int Charge { get; set; }
        public bool IsGst { get; set; }
    }   


    public class PublishedRate
    {
        public PublishedRate(JObject json)
        {
            this.BaseRate = json.SelectToken("$.BaseRate").Value<decimal>();
            this.SubTotal1 = json.SelectToken("$.SubTotal1").Value<decimal>();
            this.SubTotal2 = json.SelectToken("$.SubTotal2").Value<decimal>();
            this.SubTotal3 = json.SelectToken("$.SubTotal3").Value<decimal>();
            this.TaxRemark = json.SelectToken("$.TaxRemark").Value<string>();
            this.Total = json.SelectToken("$.Total").Value<decimal>();
            this.TotalBeforeDiscount = json.SelectToken("$.TotalBeforeDiscount").Value<decimal>();

        }
        public string RateStepInfo { get; set; }
        public decimal BaseRate { get; set; }
        public decimal SubTotal1 { get; set; }
        public IList<AddOn> AddOns { get;} = new List<AddOn>();
        public decimal SubTotal2 { get; set; }
        public decimal SubTotal3 { get; set; }
        public decimal TotalBeforeDiscount { get; set; }
        public decimal Total { get; set; }
        public string TaxRemark { get; set; }
        public List<object> Discounts { get; set; }
    }
    
}
