namespace Bespoke.PostEntt.Ost.Services
{
    public class QuotationRequest
    {
        public string ItemCategory { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Width{ get; set; }
        public decimal? Length { get; set; }
        public decimal? Height { get; set; }
        public string SenderPostcode { get; set; }
        public string SenderCountry { get; set; }
        public string ReceiverPostcode { get; set; }
        public string ReceiverCountry { get; set; }

    }
}