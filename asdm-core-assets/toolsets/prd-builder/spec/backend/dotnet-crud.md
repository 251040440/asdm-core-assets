# .NET CRUD Specification

This document provides a template and guidelines for generating .NET CRUD operations using Entity Framework Core.

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| .NET | 8.0 | LTS version |
| Entity Framework Core | 8.x | ORM framework |
| ASP.NET Core | 8.x | Web framework |
| SQL Server/SQLite | - | Database (configurable) |

## Project Structure

```
src/
├── Controllers/
│   └── {Entity}Controller.cs
├── Models/
│   └── {Entity}.cs
├── DTOs/
│   ├── {Entity}RequestDTO.cs
│   └── {Entity}ResponseDTO.cs
├── Services/
│   ├── I{Entity}Service.cs
│   └── {Entity}Service.cs
├── Data/
│   └── ApplicationDbContext.cs
└── Program.cs

tests/
└── {Entity}ServiceTests.cs
```

## Entity Model Template

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YourNamespace.Models;

[Table("{EntityTable}")]
public class {Entity}
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;
}
```

## DTO Templates

### Request DTO

```csharp
using System.ComponentModel.DataAnnotations;

namespace YourNamespace.DTOs;

public class {Entity}RequestDTO
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}
```

### Response DTO

```csharp
namespace YourNamespace.DTOs;

public class {Entity}ResponseDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; }
}
```

## Service Interface Template

```csharp
namespace YourNamespace.Services;

public interface I{Entity}Service
{
    Task<IEnumerable<{Entity}ResponseDTO>> GetAllAsync();
    Task<{Entity}ResponseDTO?> GetByIdAsync(int id);
    Task<{Entity}ResponseDTO> CreateAsync({Entity}RequestDTO dto);
    Task<{Entity}ResponseDTO?> UpdateAsync(int id, {Entity}RequestDTO dto);
    Task<bool> DeleteAsync(int id);
}
```

## Service Implementation Template

```csharp
using Microsoft.EntityFrameworkCore;
using YourNamespace.Data;
using YourNamespace.DTOs;
using YourNamespace.Models;

namespace YourNamespace.Services;

public class {Entity}Service : I{Entity}Service
{
    private readonly ApplicationDbContext _context;

    public {Entity}Service(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<{Entity}ResponseDTO>> GetAllAsync()
    {
        var entities = await _context.{Entities}
            .Where(e => e.IsActive)
            .ToListAsync();
        
        return entities.Select(MapToResponseDTO);
    }

    public async Task<{Entity}ResponseDTO?> GetByIdAsync(int id)
    {
        var entity = await _context.{Entities}.FindAsync(id);
        return entity == null || !entity.IsActive ? null : MapToResponseDTO(entity);
    }

    public async Task<{Entity}ResponseDTO> CreateAsync({Entity}RequestDTO dto)
    {
        var entity = new {Entity}
        {
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.{Entities}.Add(entity);
        await _context.SaveChangesAsync();

        return MapToResponseDTO(entity);
    }

    public async Task<{Entity}ResponseDTO?> UpdateAsync(int id, {Entity}RequestDTO dto)
    {
        var entity = await _context.{Entities}.FindAsync(id);
        if (entity == null || !entity.IsActive)
            return null;

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponseDTO(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.{Entities}.FindAsync(id);
        if (entity == null)
            return false;

        // Soft delete
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return true;
    }

    private static {Entity}ResponseDTO MapToResponseDTO({Entity} entity)
    {
        return new {Entity}ResponseDTO
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive
        };
    }
}
```

## Controller Template

```csharp
using Microsoft.AspNetCore.Mvc;
using YourNamespace.DTOs;
using YourNamespace.Services;

namespace YourNamespace.Controllers;

[ApiController]
[Route("api/[controller]")]
public class {Entity}Controller : ControllerBase
{
    private readonly I{Entity}Service _service;

    public {Entity}Controller(I{Entity}Service service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<{Entity}ResponseDTO>>> GetAll()
    {
        var entities = await _service.GetAllAsync();
        return Ok(entities);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<{Entity}ResponseDTO>> GetById(int id)
    {
        var entity = await _service.GetByIdAsync(id);
        if (entity == null)
            return NotFound();
        
        return Ok(entity);
    }

    [HttpPost]
    public async Task<ActionResult<{Entity}ResponseDTO>> Create(
        [FromBody] {Entity}RequestDTO dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<{Entity}ResponseDTO>> Update(
        int id,
        [FromBody] {Entity}RequestDTO dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (updated == null)
            return NotFound();
        
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();
        
        return NoContent();
    }
}
```

## DbContext Template

```csharp
using Microsoft.EntityFrameworkCore;
using YourNamespace.Models;

namespace YourNamespace.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<{Entity}> {Entities} { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure entity
        modelBuilder.Entity<{Entity}>(entity =>
        {
            entity.HasIndex(e => e.Name).IsUnique();
        });
    }
}
```

## Program.cs Configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Services
builder.Services.AddScoped<I{Entity}Service, {Entity}Service>();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{entity} | List all active entities |
| GET | /api/{entity}/{id} | Get entity by ID |
| POST | /api/{entity} | Create new entity |
| PUT | /api/{entity}/{id} | Update entity |
| DELETE | /api/{entity}/{id} | Soft delete entity |

## Acceptance Criteria

1. All CRUD endpoints return correct HTTP status codes
2. Validation errors return 400 Bad Request with error details
3. Non-existent entities return 404 Not Found
4. Successful operations return the created/updated entity
5. Delete performs soft delete (sets IsActive = false)
6. Code follows C# naming conventions and .NET best practices
7. Unit tests cover service layer methods

## NuGet Packages

```xml
<PackageReference Include="Microsoft.AspNetCore.App.Ref" Version="8.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
<PackageReference Include="xunit" Version="2.6.2" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.5.4" />
<PackageReference Include="Moq" Version="4.20.70" />
```
