using Bespoke.Sph.Domain;
using Bespoke.Sph.WebApi;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

[RoutePrefix("api/track-traces")]
public class TrackTraceController : BaseApiController
{
    private HttpClient m_client;
    private string m_sdsApi_SdsTrackTrace_WebApi;
    private string m_sdsApi_SdsTrackTrace_WebApiHeader;
    private string m_sdsSecretKey_SdsTrackTrace_WebApi;
    private string m_sdsSecretKey_SdsTrackTrace_WebApiHeader;
    public TrackTraceController()
    {
        m_client = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("SdsBaseUrl") ?? "https://apis.pos.com.my") };
        //m_client = new HttpClient { BaseAddress = new Uri("https://apis.pos.com.my") };
        m_sdsApi_SdsTrackTrace_WebApi = ConfigurationManager.GetEnvironmentVariable("SdsApi_SdsTrackTrace_WebApi") ?? "apigateway/as2corporate/api/v2trackntracewebapijson/v1";
        m_sdsSecretKey_SdsTrackTrace_WebApi = ConfigurationManager.GetEnvironmentVariable("SdsSecretKey_SdsTrackTrace_WebApi") ?? "YTk3ZDYyNTgtMzAwMS00ZDQ0LWJjZGUtYTZlYzAxMTY5NDE3";
        m_sdsApi_SdsTrackTrace_WebApiHeader = ConfigurationManager.GetEnvironmentVariable("SdsApi_SdsTrackTrace_WebApiHeader") ?? "apigateway/as2corporate/api/trackntracewebapiheader/v1";
        m_sdsSecretKey_SdsTrackTrace_WebApiHeader = ConfigurationManager.GetEnvironmentVariable("SdsSecretKey_SdsTrackTrace_WebApiHeader") ?? "ZjE3NTc3ZTgtNDg0NC00ZGFhLTlkNWEtYTcyODAwYzk2MGU1";
    }


    [HttpGet]
    [Route("{conNote}/{culture?}")]
    public async Task<IHttpActionResult> GetTrackingAsync(string conNote, string culture = "En")
    {
        m_client.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_SdsTrackTrace_WebApi);
        string publishPointingUrl = $"{m_sdsApi_SdsTrackTrace_WebApi}?id={conNote}&Culture={culture}";

        var response = await m_client.GetStringAsync(publishPointingUrl);
        return Json(response);
    }

    [HttpGet]
    [Route("conNotes/{culture?}")]
    public async Task<IHttpActionResult> GetTrackingsAsync([FromUri] List<string> conNotes, string culture = "En")
    {
        m_client.DefaultRequestHeaders.Add("X-User-Key", m_sdsSecretKey_SdsTrackTrace_WebApiHeader);
        StringBuilder sb = new StringBuilder();
        foreach (var conNote in conNotes)
        {
            if (!string.IsNullOrEmpty(conNote))
            {
                sb.Append($"{conNote};");
            }
        }
        string publishPointingUrl = $"{m_sdsApi_SdsTrackTrace_WebApiHeader}?id={sb}&Culture={culture}";

        var response = await m_client.GetStringAsync(publishPointingUrl);
        return Json(response);
    }
}