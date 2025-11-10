namespace campaignServer.Models.DTOs
{
    public class OrganizationDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }

    public class OrganizationCreateDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class OrganizationUpdateDto : OrganizationCreateDto
    {
        public int Id { get; set; }
    }
}