using campaignServer.Models;
using Microsoft.EntityFrameworkCore;

namespace campaignServer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) :base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Campaign> Campaigns { get; set; }
        public DbSet<Lead> Leads { get; set; }
        public DbSet<Organization> Organizations { get; set; }
    }
}
