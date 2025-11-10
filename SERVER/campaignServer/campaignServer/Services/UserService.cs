using campaignServer.Data;
using campaignServer.Helpers;
using campaignServer.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace campaignServer.Services
{
    public class UserService: IUserService
    {
        private readonly AppDbContext _context;
        private readonly JwtSettings _jwtSettings;
        public UserService(AppDbContext context, IOptions<JwtSettings> jwtSettinngs) { 
            _context = context;
            _jwtSettings = jwtSettinngs.Value;
        }

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return false;

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                OrganizationId = request.OrganizationId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string?> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return null;

            // Verify password using BCrypt
            bool isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isValid) return null;

            // Generate JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim("OrganizationId", user.OrganizationId.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Get user profile with organization name
        public async Task<UserProfile?> GetProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            var organization = await _context.Organizations.FindAsync(user.OrganizationId);
            
            return new UserProfile
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                OrganizationId = user.OrganizationId,
                OrganizationName = organization?.Name ?? "Unknown"
            };
        }

        // Update user profile
        public async Task<UserProfile?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            user.Username = request.Username;
            user.Email = request.Email;
            user.OrganizationId = request.OrganizationId;

            await _context.SaveChangesAsync();
            return await GetProfileAsync(userId);
        }
    }
}
