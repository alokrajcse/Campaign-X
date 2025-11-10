using campaignServer.Data;
using campaignServer.Models;
using Microsoft.EntityFrameworkCore;

namespace campaignServer.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly AppDbContext _context;
        
        public OrganizationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Organization>> GetAllAsync()
        {
            return await _context.Organizations.ToListAsync();
        }
    }
}