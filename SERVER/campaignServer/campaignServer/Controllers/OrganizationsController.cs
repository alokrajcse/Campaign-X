using campaignServer.Services;
using Microsoft.AspNetCore.Mvc;

namespace campaignServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationService _service;

        public OrganizationsController(IOrganizationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var organizations = await _service.GetAllAsync();
            return Ok(organizations);
        }
    }
}