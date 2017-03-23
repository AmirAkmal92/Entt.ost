using FileHelpers;
using System;

namespace sap.fi.posting
{
    [DelimitedRecord("\t")]
    public class SapFiDelimited
    {
        [FieldConverter(ConverterKind.Date, "ddMMyyyy")]
        public DateTime? DocumentDate;

        [FieldConverter(ConverterKind.Date, "ddMMyyyy")]
        public DateTime? PostingDate;

        public string DocumentType;

        public string Currency;

        public string ExchangeRate;

        public string Reference;

        public string DocumentHeaderText;

        public string PostingKey;

        public string AccountNumber;

        [FieldConverter(typeof(MoneyConverter))]
        public decimal Amount;

        public string CostCenter;

        public int Quantity;

        public string TaxCode;

        public string Assignment;

        public string Text;

        public string ReferenceKey;

        public int SequenceNumber;
    }

    public class MoneyConverter : ConverterBase
    {
        public override object StringToField(string from)
        {
            return Convert.ToDecimal(Decimal.Parse(from) / 100);
        }

        public override string FieldToString(object fieldValue)
        {
            return ((decimal)fieldValue).ToString("F2");
        }

    }
}
