using System;
using System.Web.Http;
using System.Web.Http.ExceptionHandling;
using Bespoke.Sph.Domain;
using Bespoke.Sph.Web.OwinMiddlewares;
using Bespoke.Sph.WebApi;
using Microsoft.Owin.Security.Cookies;
using Newtonsoft.Json;
using Owin;
using Thinktecture.IdentityModel.WebApi;

/// <summary>
/// Summary description for Startup
/// </summary>

public class Startup
{
    public void Configuration(IAppBuilder app)
    {
        app.UseCookieAuthentication(new CookieAuthenticationOptions
        {
            // TODO : these login/logout path should be set only for ASP.Net MVC view
            //LoginPath = new PathString("/sph/sphaccount/login"),
            //LogoutPath = new PathString("/sph/sphaccount/logoff"),
            //ReturnUrlParameter = "returnUrl",
            AuthenticationType = ConfigurationManager.ApplicationName + "Cookie",
            CookieHttpOnly = true,
            ExpireTimeSpan = TimeSpan.FromMinutes(30),
            SlidingExpiration = true,
            CookieName = $".{ConfigurationManager.ApplicationName}.Cookie"
        });

        //app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);
        //app.UseGoogleAuthentication("112970609059-m6aibunjgp870t2nfd4de64uk6rhid3j.apps.googleusercontent.com", "rp51TYacrgleJjKNbuRimyQ6");

        app.RegisterCustomEntityDependencies()
            .UseCoreResource(true)
            .MapSignalRConnection();


        var config = new HttpConfiguration();
        config.MessageHandlers.Add(new MethodOverrideHandler());

        config.Formatters.JsonFormatter.UseDataContractJsonSerializer = false;
        var setting = new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None
        };
        setting.Converters.Add(new Newtonsoft.Json.Converters.StringEnumConverter());
        setting.Formatting = Formatting.Indented;

        config.Formatters.JsonFormatter.SerializerSettings = setting;
        config.MapHttpAttributeRoutes();

        config.Filters.Add(new ResourceAuthorizeAttribute());
        config.Services.Replace(typeof(IExceptionHandler), ObjectBuilder.GetObject<IExceptionHandler>());
        config.EnsureInitialized();

        app.UseResourceAuthorization(new CustomPolicyAuthorizationManager());

        app.UseJwt()
            .UseApiMetering()
            .UseWebApi(config);

    }


}