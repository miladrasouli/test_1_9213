using Microsoft.EntityFrameworkCore;
using ShopApi.Models;

namespace ShopApi.Data;

public class ShopDbContext(DbContextOptions<ShopDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductSpecification> ProductSpecifications => Set<ProductSpecification>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Article> Articles => Set<Article>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<Category>().HasIndex(x => x.Slug).IsUnique();
        modelBuilder.Entity<Product>().HasIndex(x => x.Slug).IsUnique();
        modelBuilder.Entity<Article>().HasIndex(x => x.Slug).IsUnique();
        modelBuilder.Entity<Order>().HasIndex(x => x.OrderNumber).IsUnique();
        modelBuilder.Entity<Invoice>().HasIndex(x => x.InvoiceNumber).IsUnique();
        modelBuilder.Entity<ProductSpecification>().HasIndex(x => new { x.ProductId, x.SortOrder });

        modelBuilder.Entity<Product>().Property(x => x.Price).HasPrecision(18, 2);
        modelBuilder.Entity<Product>().Property(x => x.CompareAtPrice).HasPrecision(18, 2);
        modelBuilder.Entity<Product>().Property(x => x.Rating).HasPrecision(3, 2);
        modelBuilder.Entity<Order>().Property(x => x.Subtotal).HasPrecision(18, 2);
        modelBuilder.Entity<Order>().Property(x => x.ShippingCost).HasPrecision(18, 2);
        modelBuilder.Entity<Order>().Property(x => x.DiscountTotal).HasPrecision(18, 2);
        modelBuilder.Entity<Order>().Property(x => x.TaxTotal).HasPrecision(18, 2);
        modelBuilder.Entity<Order>().Property(x => x.GrandTotal).HasPrecision(18, 2);
        modelBuilder.Entity<OrderItem>().Property(x => x.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<OrderItem>().Property(x => x.LineTotal).HasPrecision(18, 2);
        modelBuilder.Entity<Invoice>().Property(x => x.PayableAmount).HasPrecision(18, 2);
        modelBuilder.Entity<ProductSpecification>().Property(x => x.Key).HasMaxLength(120);
        modelBuilder.Entity<ProductSpecification>().Property(x => x.Value).HasMaxLength(500);

        Seed(modelBuilder);
    }

    private static void Seed(ModelBuilder modelBuilder)
    {
        var electronicsId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var fashionId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var homeId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var mobileId = Guid.Parse("44444444-4444-4444-4444-444444444444");

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = electronicsId, Name = "کالای دیجیتال", Slug = "digital", Description = "موبایل، لپ‌تاپ و لوازم هوشمند" },
            new Category { Id = fashionId, Name = "مد و پوشاک", Slug = "fashion", Description = "لباس، کفش و اکسسوری" },
            new Category { Id = homeId, Name = "خانه و آشپزخانه", Slug = "home-kitchen", Description = "وسایل خانه، دکور و آشپزخانه" },
            new Category { Id = mobileId, ParentId = electronicsId, Name = "موبایل", Slug = "mobile", Description = "گوشی هوشمند و لوازم جانبی" });

        var products = new[]
        {
            new Product { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"), CategoryId = mobileId, Name = "گوشی Nova X Pro", Slug = "nova-x-pro", ShortDescription = "نمایشگر AMOLED، حافظه ۲۵۶ گیگابایت", Description = "یک گوشی قدرتمند برای کار روزانه، عکاسی و بازی با باتری بادوام و دوربین چندگانه.", Brand = "Nova", Price = 38900000, CompareAtPrice = 42100000, StockQuantity = 18, SoldCount = 92, Rating = 4.7m, IsFeatured = true },
            new Product { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"), CategoryId = electronicsId, Name = "لپ‌تاپ Orion 14", Slug = "orion-14", ShortDescription = "پردازنده نسل جدید، وزن سبک", Description = "لپ‌تاپ مناسب برنامه‌نویسی، طراحی و استفاده روزمره با نمایشگر دقیق و شارژدهی بالا.", Brand = "Orion", Price = 62900000, CompareAtPrice = 65900000, StockQuantity = 9, SoldCount = 48, Rating = 4.6m, IsFeatured = true },
            new Product { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"), CategoryId = fashionId, Name = "کتانی Urban Run", Slug = "urban-run", ShortDescription = "سبک، مقاوم و مناسب استفاده روزانه", Description = "کتانی راحت با طراحی مینیمال برای پیاده‌روی و استفاده شهری.", Brand = "Urban", Price = 3200000, CompareAtPrice = 3800000, StockQuantity = 35, SoldCount = 135, Rating = 4.4m, IsFeatured = true },
            new Product { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"), CategoryId = homeId, Name = "قهوه‌ساز Barista Mini", Slug = "barista-mini", ShortDescription = "اسپرسوساز جمع‌وجور خانگی", Description = "قهوه‌ساز کوچک با فشار مناسب، نازل بخار و مخزن قابل شستشو برای آشپزخانه‌های مدرن.", Brand = "Barista", Price = 7800000, CompareAtPrice = null, StockQuantity = 12, SoldCount = 67, Rating = 4.5m, IsFeatured = false }
        };

        modelBuilder.Entity<Product>().HasData(products);

        modelBuilder.Entity<ProductImage>().HasData(
            new ProductImage { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1"), ProductId = products[0].Id, Url = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900", AltText = products[0].Name, IsPrimary = true },
            new ProductImage { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2"), ProductId = products[1].Id, Url = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900", AltText = products[1].Name, IsPrimary = true },
            new ProductImage { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3"), ProductId = products[2].Id, Url = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900", AltText = products[2].Name, IsPrimary = true },
            new ProductImage { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4"), ProductId = products[3].Id, Url = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900", AltText = products[3].Name, IsPrimary = true });

        modelBuilder.Entity<ProductSpecification>().HasData(
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999901"), ProductId = products[0].Id, Key = "Display", Value = "6.7 inch AMOLED", SortOrder = 1 },
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999902"), ProductId = products[0].Id, Key = "Storage", Value = "256 GB", SortOrder = 2 },
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999903"), ProductId = products[0].Id, Key = "Warranty", Value = "18 months", SortOrder = 3 },
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999904"), ProductId = products[1].Id, Key = "Processor", Value = "New generation mobile CPU", SortOrder = 1 },
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999905"), ProductId = products[1].Id, Key = "Weight", Value = "1.3 kg", SortOrder = 2 },
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999906"), ProductId = products[2].Id, Key = "Upper material", Value = "Breathable textile", SortOrder = 1 },
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999907"), ProductId = products[2].Id, Key = "Use", Value = "Daily walking", SortOrder = 2 },
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999908"), ProductId = products[3].Id, Key = "Pressure", Value = "15 bar", SortOrder = 1 },
            new ProductSpecification { Id = Guid.Parse("99999999-9999-9999-9999-999999999909"), ProductId = products[3].Id, Key = "Tank", Value = "Washable removable tank", SortOrder = 2 });

        var adminId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc1");
        var customerId = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc2");
        modelBuilder.Entity<AppUser>().HasData(
            new AppUser { Id = adminId, FullName = "مدیر فروشگاه", Email = "admin@shopsuite.local", PhoneNumber = "09120000000", IsAdmin = true },
            new AppUser { Id = customerId, FullName = "مشتری نمونه", Email = "customer@shopsuite.local", PhoneNumber = "09121111111", IsAdmin = false });

        modelBuilder.Entity<Address>().HasData(new Address
        {
            Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
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

        modelBuilder.Entity<Article>().HasData(
            new Article { Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1"), Title = "راهنمای خرید موبایل در سال ۱۴۰۵", Slug = "mobile-buying-guide-1405", Summary = "چطور بین دوربین، باتری و نمایشگر انتخاب بهتری داشته باشیم.", Body = "در خرید گوشی بهتر است نیاز واقعی، بودجه، کیفیت نمایشگر، پشتیبانی نرم‌افزاری و گارانتی را کنار هم بررسی کنید.", CoverImageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900" },
            new Article { Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2"), Title = "چیدمان آشپزخانه کوچک", Slug = "small-kitchen-layout", Summary = "چند ایده کاربردی برای استفاده بهتر از فضا.", Body = "وسایل چندکاره، نور مناسب و نظم در دسته‌بندی لوازم باعث می‌شود آشپزخانه کوچک هم کارآمد و زیبا باشد.", CoverImageUrl = "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=900" });
    }
}
