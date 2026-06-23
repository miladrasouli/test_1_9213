using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
using ShopApi.Dtos;
using ShopApi.Models;

namespace ShopApi.Endpoints;

public static class StoreEndpoints
{
    public static IEndpointRouteBuilder MapStoreEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api");

        api.MapPost("/auth/login", async (ShopDbContext db, LoginRequest request) =>
        {
            var username = request.Username.Trim().ToLower();
            var passwordHash = ShopDbContext.HashPassword(request.Password);
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Username.ToLower() == username && x.PasswordHash == passwordHash);
            if (user is null)
            {
                return Results.Unauthorized();
            }

            return user.IsActive ? Results.Ok(ToAuthUser(user)) : Results.BadRequest("حساب کاربری شما هنوز توسط مدیر فعال نشده است.");
        });

        api.MapPost("/auth/register", async (ShopDbContext db, RegisterRequest request) =>
        {
            var username = request.Username.Trim().ToLower();
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest("نام کاربری و رمز عبور الزامی است.");
            }

            if (await db.Users.AnyAsync(x => x.Username.ToLower() == username || x.Email == request.Email))
            {
                return Results.BadRequest("نام کاربری یا ایمیل قبلا ثبت شده است.");
            }

            var user = new AppUser
            {
                Username = username,
                PasswordHash = ShopDbContext.HashPassword(request.Password),
                FullName = request.FullName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                IsAdmin = false,
                IsActive = false
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return Results.Created($"/api/admin/users/{user.Id}", ToProfile(user));
        });

        api.MapGet("/auth/me", async (ShopDbContext db, HttpRequest http) =>
        {
            var user = await GetRequestUser(db, http);
            return user is null ? Results.Unauthorized() : Results.Ok(ToAuthUser(user));
        });

        api.MapGet("/categories", async (ShopDbContext db) =>
            await db.Categories
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .Select(x => new CategoryDto(x.Id, x.ParentId, x.Name, x.Slug, x.Description))
                .ToListAsync());

        api.MapGet("/products", async (
            ShopDbContext db,
            Guid? categoryId,
            string? search,
            bool? featured,
            string? sort,
            int page = 1,
            int pageSize = 12) =>
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 48);

            var query = db.Products
                .AsNoTracking()
                .Include(x => x.Category)
                .Include(x => x.Images)
                .Where(x => x.IsActive);

            if (categoryId is not null)
            {
                query = query.Where(x => x.CategoryId == categoryId);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x => x.Name.Contains(search) || x.Brand.Contains(search) || x.ShortDescription.Contains(search));
            }

            if (featured is not null)
            {
                query = query.Where(x => x.IsFeatured == featured);
            }

            query = sort switch
            {
                "price-asc" => query.OrderBy(x => x.Price),
                "price-desc" => query.OrderByDescending(x => x.Price),
                "best-selling" => query.OrderByDescending(x => x.SoldCount),
                "rating" => query.OrderByDescending(x => x.Rating),
                _ => query.OrderByDescending(x => x.CreatedAt)
            };

            var total = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => ToSummary(x))
                .ToListAsync();

            return Results.Ok(new { total, page, pageSize, items });
        });

        api.MapGet("/products/best-sellers", async (ShopDbContext db, int? take) =>
        {
            var configuredTake = take ?? await GetBestSellerTake(db);
            return await db.Products
                .AsNoTracking()
                .Include(x => x.Category)
                .Include(x => x.Images)
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.SoldCount)
                .Take(Math.Clamp(configuredTake, 1, 24))
                .Select(x => ToSummary(x))
                .ToListAsync();
        });

        api.MapGet("/site-settings", async (ShopDbContext db) =>
            Results.Ok(await ToSiteSettings(db)));

        api.MapGet("/admin/site-settings", async (ShopDbContext db, HttpRequest http) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            return Results.Ok(await ToSiteSettings(db));
        });

        api.MapPut("/admin/site-settings", async (ShopDbContext db, HttpRequest http, UpsertSiteSettingsRequest request) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            await SetSetting(db, "TopBannerImageUrl", request.TopBannerImageUrl.Trim());
            await SetSetting(db, "TopBannerLink", request.TopBannerLink.Trim());
            await SetSetting(db, "TopBannerAlt", request.TopBannerAlt.Trim());
            await SetSetting(db, "BestSellerTake", Math.Clamp(request.BestSellerTake, 1, 24).ToString());
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapGet("/products/best-sellers/legacy", async (ShopDbContext db, int take = 8) =>
            await db.Products
                .AsNoTracking()
                .Include(x => x.Category)
                .Include(x => x.Images)
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.SoldCount)
                .Take(Math.Clamp(take, 1, 24))
                .Select(x => ToSummary(x))
                .ToListAsync());

        api.MapGet("/products/{slug}", async (ShopDbContext db, string slug) =>
        {
            var product = await db.Products
                .AsNoTracking()
                .Include(x => x.Category)
                .Include(x => x.Images)
                .Include(x => x.Specifications)
                .FirstOrDefaultAsync(x => x.Slug == slug && x.IsActive);

            if (product is null)
            {
                return Results.NotFound();
            }

            var similar = await db.Products
                .AsNoTracking()
                .Include(x => x.Category)
                .Include(x => x.Images)
                .Where(x => x.IsActive && x.Id != product.Id && x.CategoryId == product.CategoryId)
                .OrderByDescending(x => x.SoldCount)
                .Take(4)
                .Select(x => ToSummary(x))
                .ToListAsync();

            return Results.Ok(new ProductDetailDto(
                product.Id,
                product.CategoryId,
                product.Category?.Name ?? "",
                product.Name,
                product.Slug,
                product.ShortDescription,
                product.Description,
                product.Brand,
                product.Price,
                product.CompareAtPrice,
                product.StockQuantity,
                product.SoldCount,
                product.Rating,
                product.IsFeatured,
                product.Images.OrderByDescending(x => x.IsPrimary).Select(x => x.Url).ToList(),
                product.Specifications
                    .OrderBy(x => x.SortOrder)
                    .Select(x => new ProductSpecificationDto(x.Id, x.Key, x.Value, x.SortOrder))
                    .ToList(),
                similar));
        });

        app.MapGet("/uploads/products/{fileName}", (IWebHostEnvironment env, string fileName) =>
        {
            var safeName = Path.GetFileName(fileName);
            var uploadRoot = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), "uploads", "products");
            var filePath = Path.Combine(uploadRoot, safeName);
            if (!File.Exists(filePath))
            {
                return Results.NotFound();
            }

            var contentType = Path.GetExtension(filePath).ToLowerInvariant() switch
            {
                ".png" => "image/png",
                ".webp" => "image/webp",
                ".gif" => "image/gif",
                _ => "image/jpeg"
            };
            return Results.File(filePath, contentType);
        });

        api.MapPost("/admin/products", async (ShopDbContext db, HttpRequest http, UpsertProductRequest request) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var product = new Product
            {
                CategoryId = request.CategoryId,
                Name = request.Name,
                Slug = request.Slug,
                ShortDescription = request.ShortDescription,
                Description = request.Description,
                Brand = request.Brand,
                Price = request.Price,
                CompareAtPrice = request.CompareAtPrice,
                StockQuantity = request.StockQuantity,
                IsFeatured = request.IsFeatured,
                Images = request.ImageUrls.Select((url, index) => new ProductImage { Url = url, AltText = request.Name, IsPrimary = index == 0 }).ToList(),
                Specifications = ToSpecifications(request.Specifications)
            };

            db.Products.Add(product);
            await db.SaveChangesAsync();
            return Results.Created($"/api/products/{product.Slug}", new { product.Id, product.Slug });
        });

        api.MapPost("/admin/product-images", async (ShopDbContext db, HttpRequest http, IWebHostEnvironment env) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            if (!http.HasFormContentType)
            {
                return Results.BadRequest("فایل تصویر ارسال نشده است.");
            }

            var form = await http.ReadFormAsync();
            var files = form.Files;
            if (files.Count == 0)
            {
                return Results.BadRequest("حداقل یک تصویر انتخاب کنید.");
            }

            var uploadRoot = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), "uploads", "products");
            Directory.CreateDirectory(uploadRoot);

            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var uploaded = new List<UploadedProductImageDto>();

            foreach (var file in files)
            {
                var extension = Path.GetExtension(file.FileName);
                if (!allowedExtensions.Contains(extension))
                {
                    return Results.BadRequest($"فرمت فایل {file.FileName} مجاز نیست.");
                }

                if (file.Length > 5 * 1024 * 1024)
                {
                    return Results.BadRequest($"حجم فایل {file.FileName} بیشتر از ۵ مگابایت است.");
                }

                var safeName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
                var filePath = Path.Combine(uploadRoot, safeName);
                await using var stream = File.Create(filePath);
                await file.CopyToAsync(stream);

                var url = $"{http.Scheme}://{http.Host}/uploads/products/{safeName}";
                uploaded.Add(new UploadedProductImageDto(url, file.FileName));
            }

            return Results.Ok(uploaded);
        });

        api.MapPut("/admin/products/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id, UpsertProductRequest request) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var product = await db.Products
                .Include(x => x.Images)
                .Include(x => x.Specifications)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (product is null)
            {
                return Results.NotFound();
            }

            product.CategoryId = request.CategoryId;
            product.Name = request.Name;
            product.Slug = request.Slug;
            product.ShortDescription = request.ShortDescription;
            product.Description = request.Description;
            product.Brand = request.Brand;
            product.Price = request.Price;
            product.CompareAtPrice = request.CompareAtPrice;
            product.StockQuantity = request.StockQuantity;
            product.IsFeatured = request.IsFeatured;
            db.ProductImages.RemoveRange(product.Images);
            db.ProductSpecifications.RemoveRange(product.Specifications);
            product.Images = request.ImageUrls.Select((url, index) => new ProductImage { ProductId = product.Id, Url = url, AltText = product.Name, IsPrimary = index == 0 }).ToList();
            product.Specifications = ToSpecifications(request.Specifications)
                .Select(x =>
                {
                    x.ProductId = product.Id;
                    return x;
                })
                .ToList();

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapDelete("/admin/products/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var product = await db.Products.FindAsync(id);
            if (product is null)
            {
                return Results.NotFound();
            }

            product.IsActive = false;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapGet("/customers/{userId:guid}/profile", async (ShopDbContext db, Guid userId) =>
        {
            var user = await db.Users.AsNoTracking().Include(x => x.Addresses).FirstOrDefaultAsync(x => x.Id == userId);
            return user is null ? Results.NotFound() : Results.Ok(ToProfile(user));
        });

        api.MapPut("/customers/{userId:guid}/profile", async (ShopDbContext db, Guid userId, UpdateProfileRequest request) =>
        {
            var user = await db.Users.FindAsync(userId);
            if (user is null)
            {
                return Results.NotFound();
            }

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapPost("/customers/{userId:guid}/addresses", async (ShopDbContext db, Guid userId, UpsertAddressRequest request) =>
        {
            var userExists = await db.Users.AnyAsync(x => x.Id == userId);
            if (!userExists)
            {
                return Results.NotFound();
            }

            if (request.IsDefault)
            {
                await db.Addresses.Where(x => x.UserId == userId).ExecuteUpdateAsync(s => s.SetProperty(x => x.IsDefault, false));
            }

            var address = new Address
            {
                UserId = userId,
                Title = request.Title,
                Province = request.Province,
                City = request.City,
                Street = request.Street,
                PostalCode = request.PostalCode,
                ReceiverName = request.ReceiverName,
                ReceiverPhone = request.ReceiverPhone,
                IsDefault = request.IsDefault
            };
            db.Addresses.Add(address);
            await db.SaveChangesAsync();
            return Results.Created($"/api/customers/{userId}/profile", ToAddress(address));
        });

        api.MapGet("/customers/{userId:guid}/orders", async (ShopDbContext db, Guid userId) =>
            await db.Orders
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Items)
                .Include(x => x.Invoice)
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => ToOrder(x))
                .ToListAsync());

        api.MapPost("/orders", async (ShopDbContext db, CreateOrderRequest request) =>
        {
            if (request.Items.Count == 0)
            {
                return Results.BadRequest("سبد خرید خالی است.");
            }

            var productIds = request.Items.Select(x => x.ProductId).ToHashSet();
            var products = await db.Products.Where(x => productIds.Contains(x.Id) && x.IsActive).ToDictionaryAsync(x => x.Id);
            if (products.Count != productIds.Count)
            {
                return Results.BadRequest("برخی محصولات معتبر نیستند.");
            }

            var order = new Order
            {
                UserId = request.UserId,
                AddressId = request.AddressId,
                Notes = request.Notes,
                Status = OrderStatus.Paid,
                PaymentStatus = PaymentStatus.Paid,
                OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}"
            };

            foreach (var item in request.Items)
            {
                var product = products[item.ProductId];
                if (product.StockQuantity < item.Quantity)
                {
                    return Results.BadRequest($"موجودی {product.Name} کافی نیست.");
                }

                product.StockQuantity -= item.Quantity;
                product.SoldCount += item.Quantity;
                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    LineTotal = product.Price * item.Quantity
                });
            }

            order.Subtotal = order.Items.Sum(x => x.LineTotal);
            order.ShippingCost = order.Subtotal > 5_000_000 ? 0 : 120_000;
            order.TaxTotal = Math.Round(order.Subtotal * 0.09m, 0);
            order.GrandTotal = order.Subtotal + order.ShippingCost + order.TaxTotal - order.DiscountTotal;
            order.Invoice = new Invoice
            {
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}",
                PayableAmount = order.GrandTotal
            };

            db.Orders.Add(order);
            await db.SaveChangesAsync();

            var saved = await db.Orders.AsNoTracking().Include(x => x.User).Include(x => x.Items).Include(x => x.Invoice).FirstAsync(x => x.Id == order.Id);
            return Results.Created($"/api/orders/{order.Id}", ToOrder(saved));
        });

        api.MapGet("/admin/orders", async (ShopDbContext db, HttpRequest http) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            return Results.Ok(await db.Orders
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Items)
                .Include(x => x.Invoice)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => ToOrder(x))
                .ToListAsync());
        });

        api.MapGet("/admin/users", async (ShopDbContext db, HttpRequest http) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            return Results.Ok(await db.Users
                .AsNoTracking()
                .Include(x => x.Addresses)
                .OrderByDescending(x => x.IsAdmin)
                .ThenBy(x => x.FullName)
                .Select(x => ToProfile(x))
                .ToListAsync());
        });

        api.MapGet("/admin/users/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var user = await db.Users
                .AsNoTracking()
                .Include(x => x.Addresses)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (user is null)
            {
                return Results.NotFound();
            }

            var orders = await db.Orders
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Items)
                .Include(x => x.Invoice)
                .Where(x => x.UserId == id)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            var orderDtos = orders.Select(ToOrder).ToList();
            var paidOrders = orders.Where(x => x.PaymentStatus == PaymentStatus.Paid).ToList();
            var activities = new List<AdminUserActivityDto>
            {
                new(user.CreatedAt, "profile", "عضویت کاربر", $"حساب کاربری {user.Username} ایجاد شد.")
            };

            activities.AddRange(user.Addresses
                .OrderByDescending(x => x.IsDefault)
                .ThenBy(x => x.Title)
                .Select(x => new AdminUserActivityDto(
                    user.CreatedAt,
                    "address",
                    "آدرس ثبت‌شده",
                    $"{x.Title}: {x.Province}، {x.City}، {x.Street}")));

            activities.AddRange(orders.Select(x => new AdminUserActivityDto(
                x.CreatedAt,
                "order",
                $"سفارش {x.OrderNumber}",
                $"{x.Items.Sum(item => item.Quantity)} کالا با مبلغ {x.GrandTotal:N0} تومان")));

            return Results.Ok(new AdminUserDetailDto(
                ToProfile(user),
                user.CreatedAt,
                orders.Count,
                orders.Sum(x => x.GrandTotal),
                paidOrders.Sum(x => x.GrandTotal),
                orders.OrderByDescending(x => x.CreatedAt).Select(x => (DateTime?)x.CreatedAt).FirstOrDefault(),
                orderDtos,
                activities.OrderByDescending(x => x.OccurredAt).ToList()));
        });

        api.MapPut("/admin/users/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id, UpdateAdminUserRequest request) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var user = await db.Users.FindAsync(id);
            if (user is null)
            {
                return Results.NotFound();
            }

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.IsAdmin = request.IsAdmin;
            user.IsActive = request.IsActive;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapGet("/admin/dashboard", async (ShopDbContext db, HttpRequest http) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var bestSellerTake = await GetBestSellerTake(db);
            var bestSellers = await db.Products.AsNoTracking().Include(x => x.Category).Include(x => x.Images).OrderByDescending(x => x.SoldCount).Take(Math.Clamp(bestSellerTake, 1, 24)).Select(x => ToSummary(x)).ToListAsync();
            var recentOrders = await db.Orders.AsNoTracking().Include(x => x.User).Include(x => x.Items).Include(x => x.Invoice).OrderByDescending(x => x.CreatedAt).Take(6).Select(x => ToOrder(x)).ToListAsync();
            var totalSales = await db.Orders.Where(x => x.PaymentStatus == PaymentStatus.Paid).SumAsync(x => x.GrandTotal);
            return Results.Ok(new DashboardDto(
                await db.Products.CountAsync(),
                await db.Categories.CountAsync(),
                await db.Orders.CountAsync(),
                totalSales,
                bestSellers,
                recentOrders));
        });

        api.MapGet("/articles", async (ShopDbContext db) =>
            await db.Articles
                .AsNoTracking()
                .Where(x => x.IsPublished)
                .OrderByDescending(x => x.PublishedAt)
                .Select(x => new ArticleDto(x.Id, x.Title, x.Slug, x.Summary, x.Body, x.CoverImageUrl, x.PublishedAt))
                .ToListAsync());

        api.MapGet("/articles/{slug}", async (ShopDbContext db, string slug) =>
        {
            var article = await db.Articles.AsNoTracking().FirstOrDefaultAsync(x => x.Slug == slug && x.IsPublished);
            return article is null ? Results.NotFound() : Results.Ok(new ArticleDto(article.Id, article.Title, article.Slug, article.Summary, article.Body, article.CoverImageUrl, article.PublishedAt));
        });

        api.MapPost("/admin/articles", async (ShopDbContext db, HttpRequest http, UpsertArticleRequest request) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var article = new Article
            {
                Title = request.Title,
                Slug = request.Slug,
                Summary = request.Summary,
                Body = request.Body,
                CoverImageUrl = request.CoverImageUrl,
                IsPublished = request.IsPublished
            };
            db.Articles.Add(article);
            await db.SaveChangesAsync();
            return Results.Created($"/api/articles/{article.Slug}", new ArticleDto(article.Id, article.Title, article.Slug, article.Summary, article.Body, article.CoverImageUrl, article.PublishedAt));
        });

        api.MapGet("/footer", async (ShopDbContext db) =>
        {
            var sections = await db.FooterSections
                .AsNoTracking()
                .Include(x => x.Links)
                .Where(x => x.IsActive)
                .OrderBy(x => x.SortOrder)
                .ToListAsync();
            return sections.Select(x => ToFooterSection(x, true)).ToList();
        });

        api.MapGet("/menus", async (ShopDbContext db, string? location) =>
            await db.SiteMenuItems
                .AsNoTracking()
                .Where(x => x.IsActive && (location == null || x.Location == location))
                .OrderBy(x => x.Location)
                .ThenBy(x => x.SortOrder)
                .Select(x => new SiteMenuItemDto(x.Id, x.Location, x.Label, x.ViewKey, x.Icon, x.SortOrder, x.IsActive))
                .ToListAsync());

        api.MapGet("/admin/footer-sections", async (ShopDbContext db, HttpRequest http) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            return Results.Ok(await db.FooterSections
                .AsNoTracking()
                .Include(x => x.Links)
                .OrderBy(x => x.SortOrder)
                .Select(x => ToFooterSection(x, false))
                .ToListAsync());
        });

        api.MapPost("/admin/footer-sections", async (ShopDbContext db, HttpRequest http, UpsertFooterSectionRequest request) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var section = new FooterSection { Title = request.Title, SortOrder = request.SortOrder, IsActive = request.IsActive };
            db.FooterSections.Add(section);
            await db.SaveChangesAsync();
            return Results.Created($"/api/admin/footer-sections/{section.Id}", ToFooterSection(section, false));
        });

        api.MapPut("/admin/footer-sections/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id, UpsertFooterSectionRequest request) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var section = await db.FooterSections.FindAsync(id);
            if (section is null) return Results.NotFound();
            section.Title = request.Title;
            section.SortOrder = request.SortOrder;
            section.IsActive = request.IsActive;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapDelete("/admin/footer-sections/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id) =>
        {
            if (!await IsAdmin(db, http))
            {
                return Results.StatusCode(StatusCodes.Status403Forbidden);
            }

            var section = await db.FooterSections.Include(x => x.Links).FirstOrDefaultAsync(x => x.Id == id);
            if (section is null) return Results.NotFound();
            db.FooterLinks.RemoveRange(section.Links);
            db.FooterSections.Remove(section);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapPost("/admin/footer-links", async (ShopDbContext db, HttpRequest http, UpsertFooterLinkRequest request) =>
        {
            if (!await IsAdmin(db, http)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            var link = new FooterLink { FooterSectionId = request.FooterSectionId, Label = request.Label, ViewKey = request.ViewKey, SortOrder = request.SortOrder, IsActive = request.IsActive };
            db.FooterLinks.Add(link);
            await db.SaveChangesAsync();
            return Results.Created($"/api/admin/footer-links/{link.Id}", ToFooterLink(link));
        });

        api.MapPut("/admin/footer-links/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id, UpsertFooterLinkRequest request) =>
        {
            if (!await IsAdmin(db, http)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            var link = await db.FooterLinks.FindAsync(id);
            if (link is null) return Results.NotFound();
            link.FooterSectionId = request.FooterSectionId;
            link.Label = request.Label;
            link.ViewKey = request.ViewKey;
            link.SortOrder = request.SortOrder;
            link.IsActive = request.IsActive;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapDelete("/admin/footer-links/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id) =>
        {
            if (!await IsAdmin(db, http)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            var link = await db.FooterLinks.FindAsync(id);
            if (link is null) return Results.NotFound();
            db.FooterLinks.Remove(link);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapGet("/admin/menus", async (ShopDbContext db, HttpRequest http) =>
        {
            if (!await IsAdmin(db, http)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            return Results.Ok(await db.SiteMenuItems
                .AsNoTracking()
                .OrderBy(x => x.Location)
                .ThenBy(x => x.SortOrder)
                .Select(x => new SiteMenuItemDto(x.Id, x.Location, x.Label, x.ViewKey, x.Icon, x.SortOrder, x.IsActive))
                .ToListAsync());
        });

        api.MapPost("/admin/menus", async (ShopDbContext db, HttpRequest http, UpsertSiteMenuItemRequest request) =>
        {
            if (!await IsAdmin(db, http)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            var item = new SiteMenuItem { Location = request.Location, Label = request.Label, ViewKey = request.ViewKey, Icon = request.Icon, SortOrder = request.SortOrder, IsActive = request.IsActive };
            db.SiteMenuItems.Add(item);
            await db.SaveChangesAsync();
            return Results.Created($"/api/admin/menus/{item.Id}", ToMenuItem(item));
        });

        api.MapPut("/admin/menus/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id, UpsertSiteMenuItemRequest request) =>
        {
            if (!await IsAdmin(db, http)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            var item = await db.SiteMenuItems.FindAsync(id);
            if (item is null) return Results.NotFound();
            item.Location = request.Location;
            item.Label = request.Label;
            item.ViewKey = request.ViewKey;
            item.Icon = request.Icon;
            item.SortOrder = request.SortOrder;
            item.IsActive = request.IsActive;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapDelete("/admin/menus/{id:guid}", async (ShopDbContext db, HttpRequest http, Guid id) =>
        {
            if (!await IsAdmin(db, http)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            var item = await db.SiteMenuItems.FindAsync(id);
            if (item is null) return Results.NotFound();
            db.SiteMenuItems.Remove(item);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        api.MapGet("/about", () => new
        {
            title = "درباره فروشگاه ShopSuite",
            body = "ShopSuite یک نمونه کامل فروشگاه اینترنتی با ASP.NET Core Web API، EF Core، SQL Server و React است.",
            supportPhone = "021-00000000",
            email = "support@shopsuite.local"
        });

        return app;
    }

    private static ProductSummaryDto ToSummary(Product product) =>
        new(
            product.Id,
            product.CategoryId,
            product.Category?.Name ?? "",
            product.Name,
            product.Slug,
            product.ShortDescription,
            product.Brand,
            product.Price,
            product.CompareAtPrice,
            product.StockQuantity,
            product.SoldCount,
            product.Rating,
            product.IsFeatured,
            product.Images.OrderByDescending(x => x.IsPrimary).Select(x => x.Url).FirstOrDefault());

    private static async Task<AppUser?> GetRequestUser(ShopDbContext db, HttpRequest http)
    {
        if (!http.Headers.TryGetValue("X-User-Id", out var userIdHeader) || !Guid.TryParse(userIdHeader, out var userId))
        {
            return null;
        }

        return await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId);
    }

    private static async Task<bool> IsAdmin(ShopDbContext db, HttpRequest http)
    {
        var user = await GetRequestUser(db, http);
        return user?.IsAdmin == true;
    }

    private static string ToRole(AppUser user) => user.IsAdmin ? "Admin" : "Customer";

    private static AuthUserDto ToAuthUser(AppUser user) =>
        new(user.Id, user.Username, user.FullName, user.Email, user.PhoneNumber, ToRole(user), user.IsAdmin, user.IsActive);

    private static List<ProductSpecification> ToSpecifications(IReadOnlyList<UpsertProductSpecificationRequest>? specifications) =>
        (specifications ?? Array.Empty<UpsertProductSpecificationRequest>())
            .Where(x => !string.IsNullOrWhiteSpace(x.Key) && !string.IsNullOrWhiteSpace(x.Value))
            .Select((x, index) => new ProductSpecification
            {
                Key = x.Key.Trim(),
                Value = x.Value.Trim(),
                SortOrder = x.SortOrder <= 0 ? index + 1 : x.SortOrder
            })
            .ToList();

    private static AddressDto ToAddress(Address address) =>
        new(address.Id, address.Title, address.Province, address.City, address.Street, address.PostalCode, address.ReceiverName, address.ReceiverPhone, address.IsDefault);

    private static UserProfileDto ToProfile(AppUser user) =>
        new(user.Id, user.Username, user.FullName, user.Email, user.PhoneNumber, ToRole(user), user.IsAdmin, user.IsActive, user.Addresses.Select(ToAddress).ToList());

    private static OrderDto ToOrder(Order order) =>
        new(
            order.Id,
            order.OrderNumber,
            order.UserId,
            order.User?.FullName ?? "",
            order.Status,
            order.PaymentStatus,
            order.Subtotal,
            order.ShippingCost,
            order.DiscountTotal,
            order.TaxTotal,
            order.GrandTotal,
            order.CreatedAt,
            order.Items.Select(x => new OrderItemDto(x.ProductId, x.ProductName, x.Quantity, x.UnitPrice, x.LineTotal)).ToList(),
            order.Invoice is null ? null : new InvoiceDto(order.Invoice.Id, order.Invoice.InvoiceNumber, order.Invoice.IssuedAt, order.Invoice.PayableAmount));

    private static FooterSectionDto ToFooterSection(FooterSection section, bool onlyActiveLinks) =>
        new(
            section.Id,
            section.Title,
            section.SortOrder,
            section.IsActive,
            section.Links
                .Where(x => !onlyActiveLinks || x.IsActive)
                .OrderBy(x => x.SortOrder)
                .Select(ToFooterLink)
                .ToList());

    private static FooterLinkDto ToFooterLink(FooterLink link) =>
        new(link.Id, link.FooterSectionId, link.Label, link.ViewKey, link.SortOrder, link.IsActive);

    private static SiteMenuItemDto ToMenuItem(SiteMenuItem item) =>
        new(item.Id, item.Location, item.Label, item.ViewKey, item.Icon, item.SortOrder, item.IsActive);

    private static async Task<int> GetBestSellerTake(ShopDbContext db)
    {
        var value = await db.SiteSettings.AsNoTracking().Where(x => x.Key == "BestSellerTake").Select(x => x.Value).FirstOrDefaultAsync();
        return int.TryParse(value, out var take) ? take : 8;
    }

    private static async Task<SiteSettingsDto> ToSiteSettings(ShopDbContext db)
    {
        var settings = await db.SiteSettings.AsNoTracking().ToDictionaryAsync(x => x.Key, x => x.Value);
        return new SiteSettingsDto(
            settings.GetValueOrDefault("TopBannerImageUrl", "/didikala/img/banner/large-ads.jpg"),
            settings.GetValueOrDefault("TopBannerLink", ""),
            settings.GetValueOrDefault("TopBannerAlt", "بنر بالای فروشگاه"),
            int.TryParse(settings.GetValueOrDefault("BestSellerTake", "8"), out var take) ? Math.Clamp(take, 1, 24) : 8);
    }

    private static async Task SetSetting(ShopDbContext db, string key, string value)
    {
        var setting = await db.SiteSettings.FirstOrDefaultAsync(x => x.Key == key);
        if (setting is null)
        {
            db.SiteSettings.Add(new SiteSetting { Key = key, Value = value });
            return;
        }

        setting.Value = value;
    }
}
