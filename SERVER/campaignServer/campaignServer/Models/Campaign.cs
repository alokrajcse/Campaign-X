namespace campaignServer.Models
{
    public class Campaign
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalLeads { get; set; }
        public int OpenRate { get; set; }  
        public int ClickRate { get; set; }  
        public int ConversionRate { get; set; } 
        public decimal Revenue { get; set; } 
        public string? Status { get; set; }   
        public string? Agency { get; set; }
        public string? Buyer { get; set; }
        public string? Brand { get; set; }
        public int OrganizationId { get; set; }
    }
}
