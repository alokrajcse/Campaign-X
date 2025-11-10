using campaignServer.Models;

namespace campaignServer.Services
{
    public interface IUserService
    {
        Task<bool> RegisterAsync(RegisterRequest request);
        Task<string?> LoginAsync(LoginRequest request);
        Task<UserProfile?> GetProfileAsync(int userId);
        Task<UserProfile?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    }
}
