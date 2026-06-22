import 'package:equatable/equatable.dart';

import '../../models/cart_item.dart';
import '../../models/order.dart';

enum CartStatus { idle, submitting, success, failure }

class CartState extends Equatable {
  const CartState({
    this.items = const [],
    this.status = CartStatus.idle,
    this.lastOrder,
    this.error,
  });

  final List<CartItem> items;
  final CartStatus status;
  final Order? lastOrder;
  final String? error;

  double get total => items.fold(0, (sum, item) => sum + item.lineTotal);
  int get count => items.fold(0, (sum, item) => sum + item.quantity);

  CartState copyWith({
    List<CartItem>? items,
    CartStatus? status,
    Order? lastOrder,
    String? error,
  }) =>
      CartState(
        items: items ?? this.items,
        status: status ?? this.status,
        lastOrder: lastOrder,
        error: error,
      );

  @override
  List<Object?> get props => [items, status, lastOrder, error];
}
