using ShopApi.Models;

namespace ShopApi.Dtos;

public record CategoryDto(Guid Id, Guid? ParentId, string Name, string Slug, string? Description);

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

public record UserProfileDto(Guid Id, string FullName, string Email, string PhoneNumber, bool IsAdmin, IReadOnlyList<AddressDto> Addresses);

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
