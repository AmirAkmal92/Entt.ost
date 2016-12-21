using Bespoke.Sph.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for OstUserProfife
/// </summary>
public class OstUserProfile : UserProfile
{
    public OstUserProfile()
    {
    }

    public string PhotoId { get; set; }
    public string CreditBal { get; set; }
}