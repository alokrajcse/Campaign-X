namespace campaignServer.Models.DTOs
{
    public class CampaignDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
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
    }

    public class CampaignCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
        public string? Agency { get; set; }
        public string? Buyer { get; set; }
        public string? Brand { get; set; }
    }

    public class CampaignUpdateDto : CampaignCreateDto
    {
        public int Id { get; set; }
        public int TotalLeads { get; set; }
        public int OpenRate { get; set; }
        public int ClickRate { get; set; }
        public int ConversionRate { get; set; }
        public decimal Revenue { get; set; }
    }
}