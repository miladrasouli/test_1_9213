import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/shop_repository.dart';
import '../../models/cart_item.dart';
import '../../models/product.dart';
import 'cart_state.dart';

class CartCubit extends Cubit<CartState> {
  CartCubit(this._repository) : super(const CartState());

  final ShopRepository _repository;

  void add(ProductSummary product) {
    final index = state.items.indexWhere((item) => item.product.id == product.id);
    if (index == -1) {
      emit(state.copyWith(items: [...state.items, CartItem(product: product, quantity: 1)], status: CartStatus.idle));
      return;
    }

    final items = [...state.items];
    items[index] = items[index].copyWith(quantity: items[index].quantity + 1);
    emit(state.copyWith(items: items, status: CartStatus.idle));
  }

  void increment(String productId) {
    emit(state.copyWith(
      items: state.items
          .map((item) => item.product.id == productId ? item.copyWith(quantity: item.quantity + 1) : item)
          .toList(),
      status: CartStatus.idle,
    ));
  }

  void decrement(String productId) {
    emit(state.copyWith(
      items: state.items
          .map((item) => item.product.id == productId ? item.copyWith(quantity: item.quantity - 1) : item)
          .where((item) => item.quantity > 0)
          .toList(),
      status: CartStatus.idle,
    ));
  }

  void remove(String productId) {
    emit(state.copyWith(
      items: state.items.where((item) => item.product.id != productId).toList(),
      status: CartStatus.idle,
    ));
  }

  Future<void> submit() async {
    if (state.items.isEmpty) return;

    emit(state.copyWith(status: CartStatus.submitting));
    try {
      final order = await _repository.createOrder(state.items);
      emit(CartState(status: CartStatus.success, lastOrder: order));
    } catch (error) {
      emit(state.copyWith(status: CartStatus.failure, error: error.toString()));
    }
  }
}
