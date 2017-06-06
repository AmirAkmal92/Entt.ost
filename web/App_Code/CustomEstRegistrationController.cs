using Bespoke.Sph.Domain;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;

[RoutePrefix("api/est-registration")]
public class CustomEstRegistrationController : Controller
{

    private HttpClient m_snbClient;
    public CustomEstRegistrationController()
    {
        m_snbClient = new HttpClient { BaseAddress = new Uri(ConfigurationManager.GetEnvironmentVariable("SnbWebApp")) };
    }

    [Route("{accountno?}")]
    public async Task<ActionResult> GetCustomerDetails(string accountNo)
    {
        string publishPointingUrl = $"/profile/GetProfileDetail?accountno={accountNo}";
        var responseResult = await m_snbClient.GetAsync(publishPointingUrl);

        if (responseResult.IsSuccessStatusCode)
        {
            var outputString = await responseResult.Content.ReadAsStringAsync();
            var trimmedOutputString = outputString.Trim();
            if (trimmedOutputString.StartsWith("{") && trimmedOutputString.EndsWith("}"))
            {
                Response.StatusCode = (int)HttpStatusCode.Accepted;
                return Content(trimmedOutputString.ToString());
            }
            else
            {
                Response.StatusCode = (int)HttpStatusCode.Conflict;
                return Json(new { status = "Invalid / Conflicting format." }, JsonRequestBehavior.AllowGet);
            }
        }
        else
        {
            Response.StatusCode = (int)HttpStatusCode.NotFound;
            return Json(new { status = "Result not found." }, JsonRequestBehavior.AllowGet);
        }
    }
}
