using Microsoft.AspNetCore.Mvc;

namespace campaignServer.Controllers
{
    public class BaseController : ControllerBase
    {
        protected int GetUserOrganizationId()
        {
            var orgId = User.FindFirst("OrganizationId")?.Value;
            return int.Parse(orgId ?? "0");
        }

        protected int GetUserId()
        {
            var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            return int.Parse(userId ?? "0");
        }
    }
}