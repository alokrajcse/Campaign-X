using campaignServer.Models;

namespace campaignServer.Services
{
    public interface IOrganizationService
    {
        Task<List<Organization>> GetAllAsync();
    }
}