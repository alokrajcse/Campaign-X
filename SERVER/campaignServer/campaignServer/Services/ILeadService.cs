using campaignServer.Models;
using campaignServer.Models.DTOs;

namespace campaignServer.Services
{
    public interface ILeadService
    {
        Task<List<Lead>> GetByOrganizationAsync(int organizationId);
        Task<Lead?> GetByIdAsync(string leadId, int organizationId);
        Task<Lead> AddAsync(Lead lead, int organizationId);
        Task<Lead> UpdateAsync(Lead lead);
        Task<bool> DeleteAsync(string leadId, int organizationId);
        Task<List<Lead>> GetByFilterAsync(int organizationId, string? campaignId);
        Task<List<Lead>> AddBulkAsync(List<Lead> leads, int organizationId);
    }
}