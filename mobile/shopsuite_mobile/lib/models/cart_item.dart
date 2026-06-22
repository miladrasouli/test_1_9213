import 'product.dart';

class CartItem {
  const CartItem({
    required this.product,
    required this.quantity,
  });

  final ProductSummary product;
  final int quantity;

  double get lineTotal => product.price * quantity;

  CartItem copyWith({ProductSummary? product, int? quantity}) => CartItem(
        product: product ?? this.product,
        quantity: quantity ?? this.quantity,
      );
}
