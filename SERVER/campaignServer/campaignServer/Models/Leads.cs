using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace campaignServer.Models
{
    [Table("leads")]
    public class Lead
    {
        public int Id { get; set; }
        public string LeadId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string CampaignId { get; set; } = string.Empty;
        public string? Segment { get; set; }
        public string? Status { get; set; } = "Active";

        public int OpenRate { get; set; } = 0;
        public int ClickRate { get; set; } = 0;
        public int Conversions { get; set; } = 0;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
        public int OrganizationId { get; set; }
    }



   
}
