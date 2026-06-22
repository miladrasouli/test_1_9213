import '../config/app_config.dart';
import '../models/article.dart';
import '../models/cart_item.dart';
import '../models/category.dart';
import '../models/order.dart';
import '../models/product.dart';
import '../models/profile.dart';
import 'shop_api_client.dart';

class ShopRepository {
  const ShopRepository(this._client);

  final ShopApiClient _client;

  Future<List<Category>> getCategories() async {
    final data = await _client.getList('/categories');
    return data.map((item) => Category.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<ProductSummary>> getProducts({
    String? categoryId,
    String? search,
    String sort = 'newest',
  }) async {
    final data = await _client.getMap('/products', query: {
      if (categoryId != null && categoryId.isNotEmpty) 'categoryId': categoryId,
      if (search != null && search.isNotEmpty) 'search': search,
      'sort': sort,
      'pageSize': 48,
    });
    return (data['items'] as List<dynamic>)
        .map((item) => ProductSummary.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<ProductSummary>> getBestSellers() async {
    final data = await _client.getList('/products/best-sellers');
    return data.map((item) => ProductSummary.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<ProductDetail> getProduct(String slug) async {
    final data = await _client.getMap('/products/$slug');
    return ProductDetail.fromJson(data);
  }

  Future<UserProfile> getProfile({String userId = AppConfig.sampleUserId}) async {
    final data = await _client.getMap('/customers/$userId/profile');
    return UserProfile.fromJson(data);
  }

  Future<void> updateProfile({
    String userId = AppConfig.sampleUserId,
    required String fullName,
    required String email,
    required String phoneNumber,
  }) =>
      _client.put('/customers/$userId/profile', {
        'fullName': fullName,
        'email': email,
        'phoneNumber': phoneNumber,
      });

  Future<void> addAddress({
    String userId = AppConfig.sampleUserId,
    required Map<String, dynamic> payload,
  }) async {
    await _client.postMap('/customers/$userId/addresses', payload);
  }

  Future<List<Order>> getOrders({String userId = AppConfig.sampleUserId}) async {
    final data = await _client.getList('/customers/$userId/orders');
    return data.map((item) => Order.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Order> createOrder(List<CartItem> cart, {String userId = AppConfig.sampleUserId}) async {
    final data = await _client.postMap('/orders', {
      'userId': userId,
      'addressId': null,
      'notes': 'ثبت سفارش از اپ Flutter',
      'items': cart
          .map((item) => {
                'productId': item.product.id,
                'quantity': item.quantity,
              })
          .toList(),
    });
    return Order.fromJson(data);
  }

  Future<List<Article>> getArticles() async {
    final data = await _client.getList('/articles');
    return data.map((item) => Article.fromJson(item as Map<String, dynamic>)).toList();
  }
}
