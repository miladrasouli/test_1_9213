import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/cart/cart_cubit.dart';
import '../../data/shop_repository.dart';
import '../../models/product.dart';
import '../formatters.dart';
import '../widgets/product_card.dart';

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late Future<ProductDetail> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<ShopRepository>().getProduct(widget.slug);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('جزئیات محصول')),
      body: FutureBuilder<ProductDetail>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            if (snapshot.hasError) {
              return Center(child: Text(snapshot.error.toString()));
            }
            return const Center(child: CircularProgressIndicator());
          }

          final product = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: AspectRatio(
                  aspectRatio: 1.1,
                  child: CachedNetworkImage(imageUrl: product.imageUrls.first, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(height: 18),
              Text(product.categoryName, style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 6),
              Text(product.name, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              Text(product.description, style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  Chip(label: Text('امتیاز ${product.rating}')),
                  Chip(label: Text('موجودی ${product.stockQuantity}')),
                  Chip(label: Text('فروش ${product.soldCount}')),
                ],
              ),
              const SizedBox(height: 14),
              Text(money(product.price), style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 24, fontWeight: FontWeight.w900)),
              const SizedBox(height: 14),
              FilledButton.icon(
                onPressed: () => context.read<CartCubit>().add(product.toSummary()),
                icon: const Icon(Icons.add_shopping_cart),
                label: const Text('افزودن به سبد خرید'),
              ),
              if (product.similarProducts.isNotEmpty) ...[
                const SizedBox(height: 26),
                Text('محصولات مشابه', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 10),
                SizedBox(
                  height: 330,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: product.similarProducts.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, index) => SizedBox(
                      width: 190,
                      child: ProductCard(product: product.similarProducts[index]),
                    ),
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}
