﻿using System.Web.Mvc;

namespace web.sph.App_Code
{
    [RoutePrefix("")]
    public class HomeController : Controller
    {
        [Route("")]
        public ActionResult Index()
        {
            return View(); //disable homepage
            //return RedirectToAction("Login", "OstAccount");
        }

        [Route("track-trace")]
        public ActionResult TrackTrace()
        {
            return View();
        }

        [Route("volumetric")]
        public ActionResult Volumetric()
        {
            return View();
        }

        [Route("tnc")]
        public ActionResult Tnc()
        {
            return View();
        }

        [Route("faq")]
        public ActionResult Faq()
        {
            return View();
        }

        [Route("rates")]
        public ActionResult Rates()
        {
            return View();
        }

        [Route("est-registration-type")]
        public ActionResult EstRegistrationType()
        {
            return View();
        }
    }
}