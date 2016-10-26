using Microsoft.Owin;
using Owin;
using IdentityServer3.Core.Configuration;
using Serilog;
using web.identity.server.Configuration;

[assembly: OwinStartup(typeof(web.identity.server.Startup))]
namespace web.identity.server
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .WriteTo.RollingFile("log-{Date}.txt")
                .CreateLogger();

            var factory = new IdentityServerServiceFactory()
                        .UseInMemoryUsers(Users.Get())
                        .UseInMemoryClients(Clients.Get())
                        .UseInMemoryScopes(Scopes.Get());

            var options = new IdentityServerOptions
            {
                SigningCertificate = Certificate.Load(),
                Factory = factory,
            };

            app.Map("/core", idsrvApp =>
            {
                idsrvApp.UseIdentityServer(options);
            });

        }

    }
}