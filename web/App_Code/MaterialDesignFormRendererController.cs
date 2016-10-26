using System.Threading.Tasks;
using System.Web.Mvc;
using Bespoke.Sph.Domain;
using Bespoke.Sph.Web.ViewModels;

namespace web.sph.App_Code
{
    public class MaterialDesignFormRendererController : Controller
    {
        public async Task<ActionResult> Html(string id)
        {
            var context = new SphDataContext();
            var form = await context.LoadOneAsync<EntityForm>(f => f.Route == id);
            var ed = await context.LoadOneAsync<EntityDefinition>(f => f.Id == form.EntityDefinitionId);

            var layout = string.IsNullOrWhiteSpace(form.Layout) ? "Html2ColsWithAuditTrail" : form.Layout;
            var vm = new FormRendererViewModel(ed, form);

            return View(layout, vm);
        }
    }
}