class ProductSummary {
  const ProductSummary({
    required this.id,
    required this.categoryId,
    required this.categoryName,
    required this.name,
    required this.slug,
    required this.shortDescription,
    required this.brand,
    required this.price,
    this.compareAtPrice,
    required this.stockQuantity,
    required this.soldCount,
    required this.rating,
    required this.isFeatured,
    this.primaryImageUrl,
  });

  final String id;
  final String categoryId;
  final String categoryName;
  final String name;
  final String slug;
  final String shortDescription;
  final String brand;
  final double price;
  final double? compareAtPrice;
  final int stockQuantity;
  final int soldCount;
  final double rating;
  final bool isFeatured;
  final String? primaryImageUrl;

  factory ProductSummary.fromJson(Map<String, dynamic> json) => ProductSummary(
        id: json['id'] as String,
        categoryId: json['categoryId'] as String,
        categoryName: json['categoryName'] as String? ?? '',
        name: json['name'] as String,
        slug: json['slug'] as String,
        shortDescription: json['shortDescription'] as String,
        brand: json['brand'] as String,
        price: (json['price'] as num).toDouble(),
        compareAtPrice: (json['compareAtPrice'] as num?)?.toDouble(),
        stockQuantity: json['stockQuantity'] as int,
        soldCount: json['soldCount'] as int,
        rating: (json['rating'] as num).toDouble(),
        isFeatured: json['isFeatured'] as bool,
        primaryImageUrl: json['primaryImageUrl'] as String?,
      );
}

class ProductDetail {
  const ProductDetail({
    required this.id,
    required this.categoryId,
    required this.categoryName,
    required this.name,
    required this.slug,
    required this.shortDescription,
    required this.description,
    required this.brand,
    required this.price,
    this.compareAtPrice,
    required this.stockQuantity,
    required this.soldCount,
    required this.rating,
    required this.isFeatured,
    required this.imageUrls,
    required this.similarProducts,
  });

  final String id;
  final String categoryId;
  final String categoryName;
  final String name;
  final String slug;
  final String shortDescription;
  final String description;
  final String brand;
  final double price;
  final double? compareAtPrice;
  final int stockQuantity;
  final int soldCount;
  final double rating;
  final bool isFeatured;
  final List<String> imageUrls;
  final List<ProductSummary> similarProducts;

  factory ProductDetail.fromJson(Map<String, dynamic> json) => ProductDetail(
        id: json['id'] as String,
        categoryId: json['categoryId'] as String,
        categoryName: json['categoryName'] as String? ?? '',
        name: json['name'] as String,
        slug: json['slug'] as String,
        shortDescription: json['shortDescription'] as String,
        description: json['description'] as String,
        brand: json['brand'] as String,
        price: (json['price'] as num).toDouble(),
        compareAtPrice: (json['compareAtPrice'] as num?)?.toDouble(),
        stockQuantity: json['stockQuantity'] as int,
        soldCount: json['soldCount'] as int,
        rating: (json['rating'] as num).toDouble(),
        isFeatured: json['isFeatured'] as bool,
        imageUrls: (json['imageUrls'] as List<dynamic>).cast<String>(),
        similarProducts: (json['similarProducts'] as List<dynamic>)
            .map((item) => ProductSummary.fromJson(item as Map<String, dynamic>))
            .toList(),
      );

  ProductSummary toSummary() => ProductSummary(
        id: id,
        categoryId: categoryId,
        categoryName: categoryName,
        name: name,
        slug: slug,
        shortDescription: shortDescription,
        brand: brand,
        price: price,
        compareAtPrice: compareAtPrice,
        stockQuantity: stockQuantity,
        soldCount: soldCount,
        rating: rating,
        isFeatured: isFeatured,
        primaryImageUrl: imageUrls.isEmpty ? null : imageUrls.first,
      );
}
