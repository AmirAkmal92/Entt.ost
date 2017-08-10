using FileHelpers;
using System;

namespace e.soc.posting
{
    [DelimitedRecord("\t")]
    class ESocDelimited
    {        
        public string Indicator;
        
        public string OrderType;
        
        public string SalesOrg;
        
        public string DistributionChannel;
        
        public string Division;
        
        public string SoldToPartyAccountNumber;
        
        public string CourierIdHeader;
        
        public string CourierNameHeader;

        [FieldConverter(ConverterKind.Date, "ddMMyyyyHHmmss")]
        public DateTime? ConsignmentAcceptanceTimeStamp;
        
        public string BranchCodeHeader;
        
        public string CourierIdItem;
        
        public string ShipToPartyPostcode;
        
        public string ProductCodeMaterial;
        
        public string Quantity;
        
        public string BranchCodeItem;
        
        public string Agent;
        
        public string ConNoteNumberParent;
        
        public string ConNoteNumberChild;
        
        public string Weight;
        
        public string CustomerDeclaredWeight;
        
        public string VolumetricDimension;
        
        public string VolumetricWeight;
        
        public string ValueAdded;
        
        public string SurchargeCode;
        
        public string SumInsured;
        
        public string SubAccountRef;
        
        public string RecipientRefNumber;
        
        public string Zone;
        
        public string CountryCode;
        
        public string ItemCategoryType;
        
        public string MpsIndicator;
        
        public string OddItemAmount;
        
        public string OddItemDescription;
        
        public string PickupNumber;
        
        public string Mhl;
    }
}
