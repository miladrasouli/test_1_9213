import 'package:equatable/equatable.dart';

import '../../models/product.dart';

enum ShopHomeStatus { initial, loading, ready, failure }

class ShopHomeState extends Equatable {
  const ShopHomeState({
    this.status = ShopHomeStatus.initial,
    this.bestSellers = const [],
    this.error,
  });

  final ShopHomeStatus status;
  final List<ProductSummary> bestSellers;
  final String? error;

  ShopHomeState copyWith({
    ShopHomeStatus? status,
    List<ProductSummary>? bestSellers,
    String? error,
  }) =>
      ShopHomeState(
        status: status ?? this.status,
        bestSellers: bestSellers ?? this.bestSellers,
        error: error,
      );

  @override
  List<Object?> get props => [status, bestSellers, error];
}
