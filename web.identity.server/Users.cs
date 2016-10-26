using System.Collections.Generic;
using System.Security.Claims;
using IdentityServer3.Core.Services.InMemory;

namespace web.identity.server
{
    internal static class Users
    {
        public static List<InMemoryUser> Get()
        {
            return new List<InMemoryUser>
            {
                new InMemoryUser
                {
                    Username = "bob",
                    Password = "secret",
                    Subject = "1"
                },
                new InMemoryUser
                {
                    Username = "osman",
                    Password = "123456",
                    Subject = "2",
                    Claims = new[]
                    {
                        new Claim(ClaimTypes.Email, "osman@bespoke.com.my"),
                        new Claim(ClaimTypes.Role, "customers"),
                        new Claim(ClaimTypes.GivenName, "Osman Jaafar"),
                        new Claim(ClaimTypes.Sid, "ojsaturn@sid.com"),
                        new Claim(ClaimTypes.SerialNumber, "ojsaturn@serialnumber.com"),
                        new Claim("language", "ms-my", ClaimValueTypes.String)
                    }
                }
            };
        }
    }
}