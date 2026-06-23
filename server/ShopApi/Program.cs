using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
using ShopApi.Endpoints;
using ShopApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173", "http://127.0.0.1:5173")
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
    EnsureUserCredentials(db);
    EnsureProductSpecifications(db);
    EnsureContentManagement(db);
    EnsureSampleCustomerData(db);
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("Frontend");
app.MapStoreEndpoints();

app.Run();

static void EnsureUserCredentials(ShopDbContext db)
{
    if (!db.Database.IsInMemory())
    {
        db.Database.ExecuteSqlRaw("""
            IF COL_LENGTH('Users', 'Username') IS NULL
                ALTER TABLE [Users] ADD [Username] nvarchar(80) NOT NULL CONSTRAINT [DF_Users_Username] DEFAULT N'';

            IF COL_LENGTH('Users', 'PasswordHash') IS NULL
                ALTER TABLE [Users] ADD [PasswordHash] nvarchar(128) NOT NULL CONSTRAINT [DF_Users_PasswordHash] DEFAULT N'';

            IF COL_LENGTH('Users', 'IsActive') IS NULL
                ALTER TABLE [Users] ADD [IsActive] bit NOT NULL CONSTRAINT [DF_Users_IsActive] DEFAULT CAST(1 AS bit);
            """);
    }

    var adminId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc1");
    var customerId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc2");
    var admin = db.Users.FirstOrDefault(x => x.Id == adminId);
    var customer = db.Users.FirstOrDefault(x => x.Id == customerId);

    if (admin is not null)
    {
        admin.Username = "admin";
        admin.PasswordHash = ShopDbContext.HashPassword("Admin@123");
        admin.IsActive = true;
    }

    if (customer is not null)
    {
        customer.Username = "customer";
        customer.PasswordHash = ShopDbContext.HashPassword("Customer@123");
        customer.IsActive = true;
    }

    db.SaveChanges();

    if (!db.Database.IsInMemory())
    {
        db.Database.ExecuteSqlRaw("""
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Users_Username' AND object_id = OBJECT_ID(N'[Users]'))
                CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);
            """);
    }
}

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
                CONSTRAINT [FK_ProductSpecifications_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
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
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"), Key = "Display", Value = "6.7 inch AMOLED", SortOrder = 1 },
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"), Key = "Storage", Value = "256 GB", SortOrder = 2 },
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"), Key = "Warranty", Value = "18 months", SortOrder = 3 },
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"), Key = "Processor", Value = "New generation mobile CPU", SortOrder = 1 },
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"), Key = "Weight", Value = "1.3 kg", SortOrder = 2 },
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"), Key = "Upper material", Value = "Breathable textile", SortOrder = 1 },
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"), Key = "Use", Value = "Daily walking", SortOrder = 2 },
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"), Key = "Pressure", Value = "15 bar", SortOrder = 1 },
        new ProductSpecification { ProductId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"), Key = "Tank", Value = "Washable removable tank", SortOrder = 2 });
    db.SaveChanges();
}

static void EnsureSetting(ShopDbContext db, string key, string value)
{
    if (!db.SiteSettings.Any(x => x.Key == key))
    {
        db.SiteSettings.Add(new SiteSetting { Key = key, Value = value });
    }
}

static void EnsureSampleCustomerData(ShopDbContext db)
{
    var adminId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc1");
    var customerId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc2");
    var adminAddressId = Guid.Parse("dddddddd-dddd-dddd-dddd-ddddddddddda");
    var customerAddressId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

    if (!db.Addresses.Any(x => x.UserId == adminId))
    {
        db.Addresses.Add(new Address
        {
            Id = adminAddressId,
            UserId = adminId,
            Title = "دفتر فروشگاه",
            Province = "تهران",
            City = "تهران",
            Street = "خیابان ولیعصر، واحد مدیریت ShopSuite",
            PostalCode = "1111111111",
            ReceiverName = "مدیر فروشگاه",
            ReceiverPhone = "09120000000",
            IsDefault = true
        });
    }

    if (!db.Addresses.Any(x => x.UserId == customerId))
    {
        db.Addresses.Add(new Address
        {
            Id = customerAddressId,
            UserId = customerId,
            Title = "خانه",
            Province = "تهران",
            City = "تهران",
            Street = "خیابان ولیعصر، پلاک ۱۰",
            PostalCode = "1234567890",
            ReceiverName = "مشتری نمونه",
            ReceiverPhone = "09121111111",
            IsDefault = true
        });
    }

    if (db.Orders.Any())
    {
        db.SaveChanges();
        return;
    }

    var firstProduct = db.Products.OrderBy(x => x.CreatedAt).FirstOrDefault();
    if (firstProduct is null)
    {
        db.SaveChanges();
        return;
    }

    var order = new Order
    {
        Id = Guid.Parse("abababab-abab-abab-abab-abababababab"),
        UserId = customerId,
        AddressId = customerAddressId,
        OrderNumber = "ORD-SAMPLE-1405",
        Status = OrderStatus.Delivered,
        PaymentStatus = PaymentStatus.Paid,
        Notes = "سفارش نمونه برای نمایش سوابق خرید",
        ShippingCost = 0,
        DiscountTotal = 0,
        CreatedAt = DateTime.UtcNow.AddDays(-3)
    };

    order.Items.Add(new OrderItem
    {
        Id = Guid.Parse("acacacac-acac-acac-acac-acacacacacac"),
        ProductId = firstProduct.Id,
        ProductName = firstProduct.Name,
        Quantity = 1,
        UnitPrice = firstProduct.Price,
        LineTotal = firstProduct.Price
    });

    order.Subtotal = order.Items.Sum(x => x.LineTotal);
    order.TaxTotal = Math.Round(order.Subtotal * 0.09m, 0);
    order.GrandTotal = order.Subtotal + order.ShippingCost + order.TaxTotal - order.DiscountTotal;
    order.Invoice = new Invoice
    {
        Id = Guid.Parse("adadadad-adad-adad-adad-adadadadadad"),
        InvoiceNumber = "INV-SAMPLE-1405",
        PayableAmount = order.GrandTotal,
        IssuedAt = DateTime.UtcNow.AddDays(-3)
    };

    db.Orders.Add(order);
    db.SaveChanges();
}

static void EnsureContentManagement(ShopDbContext db)
{
    if (!db.Database.IsInMemory())
    {
        db.Database.ExecuteSqlRaw("""
            IF OBJECT_ID(N'[FooterSections]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FooterSections] (
                    [Id] uniqueidentifier NOT NULL,
                    [Title] nvarchar(max) NOT NULL,
                    [SortOrder] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    CONSTRAINT [PK_FooterSections] PRIMARY KEY ([Id])
                );
                CREATE INDEX [IX_FooterSections_SortOrder] ON [FooterSections] ([SortOrder]);
            END

            IF OBJECT_ID(N'[FooterLinks]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FooterLinks] (
                    [Id] uniqueidentifier NOT NULL,
                    [FooterSectionId] uniqueidentifier NOT NULL,
                    [Label] nvarchar(max) NOT NULL,
                    [ViewKey] nvarchar(40) NOT NULL,
                    [SortOrder] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    CONSTRAINT [PK_FooterLinks] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_FooterLinks_FooterSections_FooterSectionId] FOREIGN KEY ([FooterSectionId]) REFERENCES [FooterSections] ([Id]) ON DELETE CASCADE
                );
                CREATE INDEX [IX_FooterLinks_FooterSectionId_SortOrder] ON [FooterLinks] ([FooterSectionId], [SortOrder]);
            END

            IF OBJECT_ID(N'[SiteMenuItems]', N'U') IS NULL
            BEGIN
                CREATE TABLE [SiteMenuItems] (
                    [Id] uniqueidentifier NOT NULL,
                    [Location] nvarchar(40) NOT NULL,
                    [Label] nvarchar(max) NOT NULL,
                    [ViewKey] nvarchar(40) NOT NULL,
                    [Icon] nvarchar(max) NOT NULL,
                    [SortOrder] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    CONSTRAINT [PK_SiteMenuItems] PRIMARY KEY ([Id])
                );
                CREATE INDEX [IX_SiteMenuItems_Location_SortOrder] ON [SiteMenuItems] ([Location], [SortOrder]);
            END

            IF OBJECT_ID(N'[SiteSettings]', N'U') IS NULL
            BEGIN
                CREATE TABLE [SiteSettings] (
                    [Id] uniqueidentifier NOT NULL,
                    [Key] nvarchar(80) NOT NULL,
                    [Value] nvarchar(max) NOT NULL,
                    CONSTRAINT [PK_SiteSettings] PRIMARY KEY ([Id])
                );
                CREATE UNIQUE INDEX [IX_SiteSettings_Key] ON [SiteSettings] ([Key]);
            END
            """);
    }

    if (!db.FooterSections.Any())
    {
        var guide = new FooterSection { Title = "راهنمای خرید", SortOrder = 1, IsActive = true };
        var service = new FooterSection { Title = "خدمات مشتریان", SortOrder = 2, IsActive = true };
        var admin = new FooterSection { Title = "پنل فروشگاه", SortOrder = 3, IsActive = true };
        db.FooterSections.AddRange(guide, service, admin);
        db.FooterLinks.AddRange(
            new FooterLink { FooterSection = guide, Label = "صفحه اصلی", ViewKey = "home", SortOrder = 1, IsActive = true },
            new FooterLink { FooterSection = guide, Label = "سبد خرید", ViewKey = "cart", SortOrder = 2, IsActive = true },
            new FooterLink { FooterSection = guide, Label = "سوالات متداول", ViewKey = "faq", SortOrder = 3, IsActive = true },
            new FooterLink { FooterSection = service, Label = "پروفایل کاربری", ViewKey = "profile", SortOrder = 1, IsActive = true },
            new FooterLink { FooterSection = service, Label = "سفارش‌های من", ViewKey = "orders", SortOrder = 2, IsActive = true },
            new FooterLink { FooterSection = service, Label = "مجله فروشگاه", ViewKey = "articles", SortOrder = 3, IsActive = true },
            new FooterLink { FooterSection = admin, Label = "پنل مدیریت", ViewKey = "admin", SortOrder = 1, IsActive = true },
            new FooterLink { FooterSection = admin, Label = "ثبت محصول", ViewKey = "admin", SortOrder = 2, IsActive = true });
    }

    if (!db.SiteMenuItems.Any())
    {
        db.SiteMenuItems.AddRange(
            new SiteMenuItem { Location = "Header", Label = "صفحه اصلی", ViewKey = "home", Icon = "Home", SortOrder = 1, IsActive = true },
            new SiteMenuItem { Location = "Header", Label = "سبد خرید", ViewKey = "cart", Icon = "ShoppingBag", SortOrder = 2, IsActive = true },
            new SiteMenuItem { Location = "Header", Label = "پروفایل", ViewKey = "profile", Icon = "UserRound", SortOrder = 3, IsActive = true },
            new SiteMenuItem { Location = "Header", Label = "سفارش‌ها", ViewKey = "orders", Icon = "ReceiptText", SortOrder = 4, IsActive = true },
            new SiteMenuItem { Location = "Header", Label = "مجله فروشگاه", ViewKey = "articles", Icon = "Newspaper", SortOrder = 5, IsActive = true },
            new SiteMenuItem { Location = "Header", Label = "پنل مدیریت", ViewKey = "admin", Icon = "BarChart3", SortOrder = 6, IsActive = true });
    }

    EnsureSetting(db, "TopBannerImageUrl", "/didikala/img/banner/large-ads.jpg");
    EnsureSetting(db, "TopBannerLink", "");
    EnsureSetting(db, "TopBannerAlt", "بنر بالای فروشگاه");
    EnsureSetting(db, "BestSellerTake", "8");

    db.SaveChanges();
}
