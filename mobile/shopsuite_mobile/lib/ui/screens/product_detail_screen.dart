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
  int _selectedImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _future = context.read<ShopRepository>().getProduct(widget.slug);
  }

  void _addToCart(ProductDetail product) {
    context.read<CartCubit>().add(product.toSummary());
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(const SnackBar(content: Text('به سبد خرید اضافه شد')));
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
          final gallery = product.imageUrls.isEmpty ? <String>[] : product.imageUrls;
          final selectedImageIndex = gallery.isEmpty ? 0 : _selectedImageIndex.clamp(0, gallery.length - 1).toInt();

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: AspectRatio(
                  aspectRatio: 1.1,
                  child: gallery.isEmpty
                      ? Image.asset('assets/didikala/img/products/01.jpg', fit: BoxFit.contain)
                      : CachedNetworkImage(
                          imageUrl: gallery[selectedImageIndex],
                          fit: BoxFit.contain,
                          errorWidget: (_, __, ___) => Image.asset('assets/didikala/img/products/01.jpg', fit: BoxFit.contain),
                        ),
                ),
              ),
              if (gallery.length > 1) ...[
                const SizedBox(height: 12),
                SizedBox(
                  height: 76,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: gallery.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final selected = index == _selectedImageIndex;
                      return InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: () => setState(() => _selectedImageIndex = index),
                        child: Container(
                          width: 76,
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: selected ? Theme.of(context).colorScheme.primary : Theme.of(context).dividerColor),
                          ),
                          child: CachedNetworkImage(
                            imageUrl: gallery[index],
                            fit: BoxFit.contain,
                            errorWidget: (_, __, ___) => Image.asset('assets/didikala/img/products/01.jpg', fit: BoxFit.contain),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
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
              Text(
                money(product.price),
                style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 24, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 14),
              FilledButton.icon(
                onPressed: () => _addToCart(product),
                icon: const Icon(Icons.add_shopping_cart),
                label: const Text('افزودن به سبد خرید'),
              ),
              if (product.specifications.isNotEmpty) ...[
                const SizedBox(height: 26),
                Text('مشخصات محصول', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 10),
                ...product.specifications.map(
                  (spec) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Theme.of(context).dividerColor),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(flex: 2, child: Text(spec.key, style: const TextStyle(fontWeight: FontWeight.w800))),
                        const SizedBox(width: 12),
                        Expanded(flex: 3, child: Text(spec.value)),
                      ],
                    ),
                  ),
                ),
              ],
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
