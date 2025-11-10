using campaignServer.Models;
using campaignServer.Models.DTOs;

namespace campaignServer.Services
{
    public interface ICampaignService
    {
        Task<List<Campaign>> GetByOrganizationAsync(int organizationId);
        Task<Campaign?> GetByIdAsync(int id, int organizationId);
        Task<Campaign> AddAsync(Campaign campaign, int organizationId);
        Task<Campaign> UpdateAsync(Campaign campaign);
        Task<bool> DeleteAsync(int id);
        Task<List<Campaign>> GetFilteredAsync(int organizationId, string? name);
        Task<CampaignAnalyticsResponseDto?> GetCampaignAnalyticsAsync(int campaignId, int organizationId);
    }
}