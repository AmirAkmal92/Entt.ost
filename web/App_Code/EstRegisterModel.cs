public class EstRegisterModel
{
    public string AccountNo { get; set; }
    public string EmailAddress { get; set; }
    public string ContactNo { get; set; }
    public object AltContactNo { get; set; }
    public string CustomerName { get; set; }
    public string CompanyName { get; set; }
    public int AccountStatus { get; set; }
    public Address Address { get; set; }
    public Address BillingAddress { get; set; }
    public Address PickupAddress { get; set; }
}
public class Address
{
    public string Address1 { get; set; }
    public string Address2 { get; set; }
    public string Address3 { get; set; }
    public string Address4 { get; set; }
    public string Address5 { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public object Postcode { get; set; }
    public string Country { get; set; }
}
