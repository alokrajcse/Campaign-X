using campaignServer.Models;
using campaignServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace campaignServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CampaignsController : BaseController
    {
        private readonly ICampaignService _service;

        public CampaignsController(ICampaignService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? name)
        {
            var organizationId = GetUserOrganizationId();
            var campaigns = await _service.GetFilteredAsync(organizationId, name);
            return Ok(campaigns);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var organizationId = GetUserOrganizationId();
            var campaign = await _service.GetByIdAsync(id, organizationId);
            if (campaign == null) return NotFound();
            return Ok(campaign);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Campaign campaign)
        {
            var organizationId = GetUserOrganizationId();
            var created = await _service.AddAsync(campaign, organizationId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Campaign campaign)
        {
            if (id != campaign.Id) return BadRequest("ID mismatch");
            var updated = await _service.UpdateAsync(campaign);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return Ok("Campaign deleted successfully");
        }

        [HttpGet("{id}/analytics")]
        public async Task<IActionResult> GetAnalytics(int id)
        {
            var organizationId = GetUserOrganizationId();
            var analytics = await _service.GetCampaignAnalyticsAsync(id, organizationId);
            if (analytics == null) return NotFound();
            return Ok(analytics);
        }

        [HttpGet("dropdown-data")]
        public IActionResult GetDropdownData()
        {
            var data = new
            {
                agencies = new[] { "Agency A", "Agency B", "Agency C" },
                buyers = new[] { "Buyer X", "Buyer Y", "Buyer Z" },
                brands = new[] { "Brand One", "Brand Two", "Brand Three" }
            };
            return Ok(data);
        }
    }
}
