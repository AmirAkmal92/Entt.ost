namespace Bespoke.PostEntt.Ost.Services
{
    public class QuotationRequest
    {
        private decimal? m_weight;
        public string ItemCategory { get; set; }

        public decimal? Weight
        {
            get
            {
                if ((Width ?? 0) >= 30 || (Length ?? 0) >= 30 || (Height ?? 0) >= 30)
                {
                    var volumetric = (Width ?? 0) * (Length ?? 0) * (Height ?? 0) / 6000;
                    return System.Math.Max(m_weight ?? 0, volumetric);
                }

                return (m_weight ?? 0);
            }
            set { m_weight = value; }
        }

        public decimal? Width { get; set; }
        public decimal? Length { get; set; }
        public decimal? Height { get; set; }
        public string SenderPostcode { get; set; }
        public string SenderCountry { get; set; }
        public string ReceiverPostcode { get; set; }
        public string ReceiverCountry { get; set; }

    }
}