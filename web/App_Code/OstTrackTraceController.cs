using System.Web.Mvc;

namespace web.sph.App_Code
{
    [RoutePrefix("track-trace")]
    public class OstTrackTraceController : Controller
    {
        [Route("")]
        [HttpGet]
        public ActionResult TrackTrace()
        {
            return View();
        }
    }
}