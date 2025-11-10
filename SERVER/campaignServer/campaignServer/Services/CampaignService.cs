using campaignServer.Data;
using campaignServer.Models;
using campaignServer.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace campaignServer.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly AppDbContext _context;
        
        public CampaignService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Campaign>> GetByOrganizationAsync(int organizationId)
        {
            return await _context.Campaigns
                .Where(c => c.OrganizationId == organizationId)
                .ToListAsync();
        }

        public async Task<Campaign?> GetByIdAsync(int id, int organizationId)
        {
            return await _context.Campaigns
                .FirstOrDefaultAsync(c => c.Id == id && c.OrganizationId == organizationId);
        }

        public async Task<Campaign> AddAsync(Campaign campaign, int organizationId)
        {
            campaign.OrganizationId = organizationId;
            
            _context.Campaigns.Add(campaign);
            await _context.SaveChangesAsync();
            return campaign;
        }

        public async Task<Campaign> UpdateAsync(Campaign campaign)
        {
            _context.Campaigns.Update(campaign);
            await _context.SaveChangesAsync();
            return campaign;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var campaign = await _context.Campaigns.FindAsync(id);
            if (campaign == null) return false;
            
            _context.Campaigns.Remove(campaign);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Campaign>> GetFilteredAsync(int organizationId, string? name)
        {
            var campaigns = await _context.Campaigns
                .Where(c => c.OrganizationId == organizationId)
                .ToListAsync();
            
            if (!string.IsNullOrEmpty(name))
            {
                campaigns = campaigns.Where(c => c.Name.Contains(name)).ToList();
            }
                
            return campaigns;
        }

        public async Task<CampaignAnalyticsResponseDto?> GetCampaignAnalyticsAsync(int campaignId, int organizationId)
        {
            var campaign = await GetByIdAsync(campaignId, organizationId);
            if (campaign == null) return null;

            var leads = await _context.Leads
                .Where(l => l.CampaignId == campaign.Name && l.OrganizationId == organizationId)
                .ToListAsync();
            
            var totalLeads = leads.Count;
            var openedEmails = leads.Count(l => l.OpenRate > 0);
            var clickedLeads = leads.Count(l => l.ClickRate > 0);
            var convertedLeads = leads.Count(l => l.Conversions > 0);

            var metrics = new AnalyticsMetricsDto
            {
                TotalLeads = totalLeads,
                OpenRate = totalLeads > 0 ? (openedEmails * 100) / totalLeads : 0,
                ClickRate = totalLeads > 0 ? (clickedLeads * 100) / totalLeads : 0,
                ConversionRate = totalLeads > 0 ? (convertedLeads * 100) / totalLeads : 0,
                Revenue = convertedLeads * 150
            };

            return new CampaignAnalyticsResponseDto
            {
                Campaign = campaign,
                Metrics = metrics
            };
        }
    }
}
