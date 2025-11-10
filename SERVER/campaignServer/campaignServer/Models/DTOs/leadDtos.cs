using System;
using System.Collections.Generic;

namespace campaignServer.Models.DTOs
{
    public class LeadCreateDto
    {
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
    }

    public class LeadDto : LeadCreateDto
    {
        public int Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        
        public int OpenRate { get; set; } = 0;     
        public int ClickRate { get; set; } = 0;    
        public int Conversions { get; set; } = 0;  
        public DateTime? LastEngagementDate { get; set; }
    }

    public class BulkLeadRequestDto
    {
        public List<LeadCreateDto> Leads { get; set; } = new();
        public BulkOptions Options { get; set; } = new();
    }

    public class BulkOptions
    {
        public bool OverwriteExisting { get; set; } = false;
    }

    public class BulkLeadSummaryDto
    {
        public int Processed { get; set; }
        public int Inserted { get; set; }
        public int Updated { get; set; }
        public List<string> Duplicates { get; set; } = new();
        public List<RejectedRow> Rejected { get; set; } = new();

        public class RejectedRow
        {
            public int Row { get; set; }
            public int Index { get; set; }
            public string LeadId { get; set; } = string.Empty;
            public string Reason { get; set; } = string.Empty;
        }
    }


    public class MultiLeadSearchRequestDto
    {
        public List<string>? Identifiers { get; set; } 
        public string? RawInput { get; set; } 
    }

    public class MultiLeadSearchResponseDto
    {
        public List<LeadDto> Found { get; set; } = new();
        public List<string> NotFound { get; set; } = new();
        public SearchSummaryDto Summary { get; set; } = new();
    }

    public class SearchSummaryDto
    {
        public int Requested { get; set; }
        public int Found { get; set; }
        public int NotFound { get; set; }
    }
}
