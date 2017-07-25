using System.Collections.Generic;

namespace Bespoke.PosEntt.CustomActions
{
    class Profile
    {
        public string UserId { get; set; }
        public string Id { get; set; }
        public string SbuName { get; set; }
        public string RefNo { get; set; }
        public CompanyInfo CompanyInformation { get; set; }
        public List<Document> Documents { get; set; }
        public List<DirectorInformation> DirectorInformations { get; set; }
        public PersonDetail PersonalDetail { get; set; }
    }
    public class PersonDetail
    {
        public string ContactPersonName { get; set; }
        public string ContactPersonIc { get; set; }
        public ContactInfo ContactInformation { get; set; }
        public MailAddress MailingAddress { get; set; }
        public BillAddress BillingAddress { get; set; }
        public PickAddress PickupAddress { get; set; }
    }
    public class Document
    {
        public string Id { get; set; }
        public string DocTypeId { get; set; }
        public string DocType { get; set; }
    }
    public class DirectorInformation
    {
        public string DirectorName { get; set; }
        public string DirectorIcNumber { get; set; }
        public string DirectorUserId { get; set; }
    }
    public class CompanyInfo
    {
        public string CompanyName { get; set; }
        public string CompanyType { get; set; }
        public string Industry { get; set; }
        public string GstId { get; set; }
        public string TypePosting { get; set; }
        public bool IsPosLajuAgent { get; set; }
        public string RocNumber { get; set; }
        public string CurrencyCode { get; set; }
    }
    public class ContactInfo
    {
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string AlternativeContactNumber { get; set; }
    }
    public class MailAddress
    {
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Address4 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public string Postcode { get; set; }
        public GeoLocation GeoLocation { get; set; }
    }
    public class BillAddress
    {
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Address4 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public string Postcode { get; set; }
        public GeoLocation GeoLocation { get; set; }
    }
    public class PickAddress
    {
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Address4 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public string Postcode { get; set; }
        public GeoLocation GeoLocation { get; set; }
    }
    public class GeoLocation
    {
        public decimal Lat { get; set; }
        public decimal Long { get; set; }
    }
}
