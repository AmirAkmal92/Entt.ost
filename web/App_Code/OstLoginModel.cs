using System;
namespace web.sph.App_Code
{
    public class OstLoginModel
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public bool RememberMe { get; set; }
        public string grant_type { get; set; }
        public DateTime expiry { get; set; }
        public string Email { get; set; }
    }
}