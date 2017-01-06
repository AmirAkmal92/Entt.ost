using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using Bespoke.PostEntt.Ost.Services;
using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using System.Linq;
using System;
using System.Net.Http;

[RoutePrefix("api/track-traces")]
public class TrackTraceController : BaseApiController
{
    private HttpClient m_client;
    public TrackTraceController()
    {
        m_client = new HttpClient { BaseAddress = new Uri(Bespoke.Sph.Domain.ConfigurationManager.GetEnvironmentVariable("SdsBaseUrl") ?? "https://apis.pos.com.my") };
    }


    [HttpGet]
    [Route("{conNote}/{culture?}")]
    public async Task<IHttpActionResult> GetTrackingAsync(string conNote, string culture="En")
    {
        m_client.DefaultRequestHeaders.Add("X-User-Key", Bespoke.Sph.Domain.ConfigurationManager.GetEnvironmentVariable("SdsTrackTraceKey") ?? "YTk3ZDYyNTgtMzAwMS00ZDQ0LWJjZGUtYTZlYzAxMTY5NDE3");
        string publishPointingUrl = $"apigateway/as2corporate/api/v2trackntracewebapijson/v1?id={conNote}&Culture={culture}";
    
        var response = await m_client.GetStringAsync(publishPointingUrl );
        return Json(response);
        

    }

}