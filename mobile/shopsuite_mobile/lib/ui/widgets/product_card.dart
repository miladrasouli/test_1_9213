import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/cart/cart_cubit.dart';
import '../../models/product.dart';
import '../formatters.dart';
import '../screens/product_detail_screen.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product});

  final ProductSummary product;

  void _addToCart(BuildContext context) {
    context.read<CartCubit>().add(product);
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(const SnackBar(content: Text('به سبد خرید اضافه شد')));
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: InkWell(
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => ProductDetailScreen(slug: product.slug)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AspectRatio(
                    aspectRatio: 1.35,
                    child: CachedNetworkImage(
                      imageUrl: product.primaryImageUrl ?? '',
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Image.asset('assets/didikala/img/products/01.jpg', fit: BoxFit.contain),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${product.categoryName} / ${product.brand}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.labelSmall,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          product.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          money(product.price),
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: FilledButton.icon(
              onPressed: () => _addToCart(context),
              icon: const Icon(Icons.add_shopping_cart, size: 18),
              label: const Text('افزودن'),
            ),
          ),
        ],
      ),
    );
  }
}
