using System;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace web.sph.App_Code
{
    [RoutePrefix("print-excel")]
    public partial class PrintExcelController : Controller
    {

        [Route("file-path/{filePath}/file-name/{fileName}")]
        public FilePathResult GetExcelFile(string filePath, string fileName)
        {
            var path = Path.Combine(Path.GetTempPath(), filePath);
            return File(path, MimeMapping.GetMimeMapping(filePath), $"{fileName}_{DateTime.Now:yyyyMMdd-HHmmss}.xlsx");
        }

    }
}