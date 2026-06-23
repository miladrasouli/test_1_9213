using ShopApi.Models;

namespace ShopApi.Dtos;

public record CategoryDto(Guid Id, Guid? ParentId, string Name, string Slug, string? Description);

public record LoginRequest(string Username, string Password);

public record RegisterRequest(string Username, string Password, string FullName, string Email, string PhoneNumber);

public record AuthUserDto(Guid Id, string Username, string FullName, string Email, string PhoneNumber, string Role, bool IsAdmin, bool IsActive);

public record ProductSummaryDto(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string Name,
    string Slug,
    string ShortDescription,
    string Brand,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQuantity,
    int SoldCount,
    decimal Rating,
    bool IsFeatured,
    string? PrimaryImageUrl);

public record ProductSpecificationDto(Guid Id, string Key, string Value, int SortOrder);

public record UploadedProductImageDto(string Url, string FileName);

public record ProductDetailDto(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string Name,
    string Slug,
    string ShortDescription,
    string Description,
    string Brand,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQuantity,
    int SoldCount,
    decimal Rating,
    bool IsFeatured,
    IReadOnlyList<string> ImageUrls,
    IReadOnlyList<ProductSpecificationDto> Specifications,
    IReadOnlyList<ProductSummaryDto> SimilarProducts);

public record UpsertProductSpecificationRequest(string Key, string Value, int SortOrder);

public record UpsertProductRequest(
    Guid CategoryId,
    string Name,
    string Slug,
    string ShortDescription,
    string Description,
    string Brand,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQuantity,
    bool IsFeatured,
    IReadOnlyList<string> ImageUrls,
    IReadOnlyList<UpsertProductSpecificationRequest>? Specifications);

public record AddressDto(
    Guid Id,
    string Title,
    string Province,
    string City,
    string Street,
    string PostalCode,
    string ReceiverName,
    string ReceiverPhone,
    bool IsDefault);

public record UpsertAddressRequest(
    string Title,
    string Province,
    string City,
    string Street,
    string PostalCode,
    string ReceiverName,
    string ReceiverPhone,
    bool IsDefault);

public record UserProfileDto(Guid Id, string Username, string FullName, string Email, string PhoneNumber, string Role, bool IsAdmin, bool IsActive, IReadOnlyList<AddressDto> Addresses);

public record UpdateAdminUserRequest(string FullName, string Email, string PhoneNumber, bool IsAdmin, bool IsActive);

public record AdminUserActivityDto(DateTime OccurredAt, string Type, string Title, string Description);

public record AdminUserDetailDto(
    UserProfileDto Profile,
    DateTime CreatedAt,
    int OrderCount,
    decimal TotalSpent,
    decimal PaidTotal,
    DateTime? LastOrderAt,
    IReadOnlyList<OrderDto> Orders,
    IReadOnlyList<AdminUserActivityDto> Activities);

public record UpdateProfileRequest(string FullName, string Email, string PhoneNumber);

public record OrderItemRequest(Guid ProductId, int Quantity);

public record CreateOrderRequest(Guid UserId, Guid? AddressId, IReadOnlyList<OrderItemRequest> Items, string? Notes);

public record OrderItemDto(Guid ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal LineTotal);

public record InvoiceDto(Guid Id, string InvoiceNumber, DateTime IssuedAt, decimal PayableAmount);

public record OrderDto(
    Guid Id,
    string OrderNumber,
    Guid UserId,
    string CustomerName,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    decimal Subtotal,
    decimal ShippingCost,
    decimal DiscountTotal,
    decimal TaxTotal,
    decimal GrandTotal,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemDto> Items,
    InvoiceDto? Invoice);

public record ArticleDto(Guid Id, string Title, string Slug, string Summary, string Body, string CoverImageUrl, DateTime PublishedAt);

public record UpsertArticleRequest(string Title, string Slug, string Summary, string Body, string CoverImageUrl, bool IsPublished);

public record DashboardDto(
    int ProductCount,
    int CategoryCount,
    int OrderCount,
    decimal TotalSales,
    IReadOnlyList<ProductSummaryDto> BestSellers,
    IReadOnlyList<OrderDto> RecentOrders);

public record FooterLinkDto(Guid Id, Guid FooterSectionId, string Label, string ViewKey, int SortOrder, bool IsActive);

public record FooterSectionDto(Guid Id, string Title, int SortOrder, bool IsActive, IReadOnlyList<FooterLinkDto> Links);

public record UpsertFooterSectionRequest(string Title, int SortOrder, bool IsActive);

public record UpsertFooterLinkRequest(Guid FooterSectionId, string Label, string ViewKey, int SortOrder, bool IsActive);

public record SiteMenuItemDto(Guid Id, string Location, string Label, string ViewKey, string Icon, int SortOrder, bool IsActive);

public record UpsertSiteMenuItemRequest(string Location, string Label, string ViewKey, string Icon, int SortOrder, bool IsActive);

public record SiteSettingsDto(string TopBannerImageUrl, string TopBannerLink, string TopBannerAlt, int BestSellerTake);

public record UpsertSiteSettingsRequest(string TopBannerImageUrl, string TopBannerLink, string TopBannerAlt, int BestSellerTake);
