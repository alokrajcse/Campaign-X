using campaignServer.Data;
using campaignServer.Models;
using Microsoft.EntityFrameworkCore;

namespace campaignServer.Services
{
    public class LeadService : ILeadService
    {
        private readonly AppDbContext _context;
        
        public LeadService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Lead>> GetByOrganizationAsync(int organizationId)
        {
            return await _context.Leads
                .Where(l => l.OrganizationId == organizationId)
                .ToListAsync();
        }

        public async Task<Lead?> GetByIdAsync(string leadId, int organizationId)
        {
            return await _context.Leads
                .FirstOrDefaultAsync(l => l.LeadId == leadId && l.OrganizationId == organizationId);
        }

        public async Task<Lead> AddAsync(Lead lead, int organizationId)
        {
            lead.CreatedDate = DateTime.UtcNow;
            lead.OrganizationId = organizationId;
            
            _context.Leads.Add(lead);
            await _context.SaveChangesAsync();
            return lead;
        }

        public async Task<Lead> UpdateAsync(Lead lead)
        {
            lead.UpdatedDate = DateTime.UtcNow;
            _context.Leads.Update(lead);
            await _context.SaveChangesAsync();
            return lead;
        }

        public async Task<bool> DeleteAsync(string leadId, int organizationId)
        {
            var lead = await GetByIdAsync(leadId, organizationId);
            if (lead == null) return false;
            
            _context.Leads.Remove(lead);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Lead>> GetByFilterAsync(int organizationId, string? campaignId)
        {
            var leads = await _context.Leads
                .Where(l => l.OrganizationId == organizationId)
                .ToListAsync();
            
            if (!string.IsNullOrEmpty(campaignId))
            {
                leads = leads.Where(l => l.CampaignId == campaignId).ToList();
            }
                
            return leads;
        }

        public async Task<List<Lead>> AddBulkAsync(List<Lead> leads, int organizationId)
        {
            foreach (var lead in leads)
            {
                lead.CreatedDate = DateTime.UtcNow;
                lead.OrganizationId = organizationId;
            }
            
            _context.Leads.AddRange(leads);
            await _context.SaveChangesAsync();
            return leads;
        }
    }
}