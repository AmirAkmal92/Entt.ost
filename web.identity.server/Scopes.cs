using System.Collections.Generic;
using IdentityServer3.Core.Models;

namespace web.identity.server
{
    internal static class Scopes
    {
        public static List<Scope> Get()
        {
            return new List<Scope>
           {
                StandardScopes.OpenId,
                StandardScopes.Profile,
                StandardScopes.Email,
                new Scope {Name = "roles", Claims = new List<ScopeClaim> {new ScopeClaim("role")} },
            };
        }
    }
}