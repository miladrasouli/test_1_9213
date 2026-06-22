using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
using ShopApi.Endpoints;
using ShopApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5177",
            "http://127.0.0.1:5177",
            "https://localhost:5173",
            "https://localhost:5177"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddDbContext<ShopDbContext>(options =>
{
    if (builder.Configuration.GetValue<bool>("UseInMemoryDatabase"))
    {
        options.UseInMemoryDatabase("ShopSuiteDev");
        return;
    }

    options.UseSqlServer(
        builder.Configuration.GetConnectionString("ShopDb"),
        sql => sql.EnableRetryOnFailure());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ShopDbContext>();
    db.Database.EnsureCreated();
    EnsureProductSpecifications(db);
}

// مهم: در Development این را فعال نکن چون باعث Redirect شدن preflight می‌شود
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");

app.MapStoreEndpoints();

app.Run();

static void EnsureProductSpecifications(ShopDbContext db)
{
    if (db.Database.IsInMemory())
    {
        return;
    }

    db.Database.ExecuteSqlRaw("""
        IF OBJECT_ID(N'[ProductSpecifications]', N'U') IS NULL
        BEGIN
            CREATE TABLE [ProductSpecifications] (
                [Id] uniqueidentifier NOT NULL,
                [ProductId] uniqueidentifier NOT NULL,
                [Key] nvarchar(120) NOT NULL,
                [Value] nvarchar(500) NOT NULL,
                [SortOrder] int NOT NULL,
                CONSTRAINT [PK_ProductSpecifications] PRIMARY KEY ([Id]),
                CONSTRAINT [FK_ProductSpecifications_Products_ProductId]
                    FOREIGN KEY ([ProductId])
                    REFERENCES [Products] ([Id])
                    ON DELETE CASCADE
            );

            CREATE INDEX [IX_ProductSpecifications_ProductId_SortOrder]
                ON [ProductSpecifications] ([ProductId], [SortOrder]);
        END
        """);

    if (db.ProductSpecifications.Any())
    {
        return;
    }

    db.ProductSpecifications.AddRange(
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
            Key = "Display",
            Value = "6.7 inch AMOLED",
            SortOrder = 1
        },
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
            Key = "Storage",
            Value = "256 GB",
            SortOrder = 2
        },
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
            Key = "Warranty",
            Value = "18 months",
            SortOrder = 3
        },
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
            Key = "Processor",
            Value = "New generation mobile CPU",
            SortOrder = 1
        },
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
            Key = "Weight",
            Value = "1.3 kg",
            SortOrder = 2
        },
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"),
            Key = "Upper material",
            Value = "Breathable textile",
            SortOrder = 1
        },
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"),
            Key = "Use",
            Value = "Daily walking",
            SortOrder = 2
        },
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"),
            Key = "Pressure",
            Value = "15 bar",
            SortOrder = 1
        },
        new ProductSpecification
        {
            ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"),
            Key = "Tank",
            Value = "Washable removable tank",
            SortOrder = 2
        });

    db.SaveChanges();
}