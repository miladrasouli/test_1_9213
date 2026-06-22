import 'package:equatable/equatable.dart';

import '../../models/category.dart';
import '../../models/product.dart';

enum CatalogStatus { initial, loading, ready, failure }

class CatalogState extends Equatable {
  const CatalogState({
    this.status = CatalogStatus.initial,
    this.categories = const [],
    this.products = const [],
    this.categoryId = '',
    this.search = '',
    this.sort = 'newest',
    this.error,
  });

  final CatalogStatus status;
  final List<Category> categories;
  final List<ProductSummary> products;
  final String categoryId;
  final String search;
  final String sort;
  final String? error;

  CatalogState copyWith({
    CatalogStatus? status,
    List<Category>? categories,
    List<ProductSummary>? products,
    String? categoryId,
    String? search,
    String? sort,
    String? error,
  }) =>
      CatalogState(
        status: status ?? this.status,
        categories: categories ?? this.categories,
        products: products ?? this.products,
        categoryId: categoryId ?? this.categoryId,
        search: search ?? this.search,
        sort: sort ?? this.sort,
        error: error,
      );

  @override
  List<Object?> get props => [status, categories, products, categoryId, search, sort, error];
}
