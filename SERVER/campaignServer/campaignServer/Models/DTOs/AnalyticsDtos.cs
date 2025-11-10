namespace campaignServer.Models.DTOs
{
    public class CampaignAnalyticsResponseDto
    {
        public Campaign Campaign { get; set; } = default!;
        public List<SegmentBreakdownDto> Segments { get; set; } = new();
        public AnalyticsMetricsDto Metrics { get; set; } = new();
    }

    public class SegmentBreakdownDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public int Percentage { get; set; }
    }

    public class AnalyticsMetricsDto
    {
        public int TotalLeads { get; set; }
        public int OpenRate { get; set; }
        public int ClickRate { get; set; }
        public int ConversionRate { get; set; }
        public decimal Revenue { get; set; }
        public int CampaignDuration { get; set; }
    }
}