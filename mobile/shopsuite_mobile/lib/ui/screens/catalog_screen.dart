import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/catalog/catalog_cubit.dart';
import '../../blocs/catalog/catalog_state.dart';
import '../widgets/empty_state.dart';
import '../widgets/product_card.dart';

class CatalogScreen extends StatelessWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('محصولات')),
      body: BlocBuilder<CatalogCubit, CatalogState>(
        builder: (context, state) {
          if (state.status == CatalogStatus.loading && state.products.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == CatalogStatus.failure) {
            return EmptyState(icon: Icons.error_outline, title: 'خطا در دریافت محصولات', message: state.error);
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'جستجوی محصول یا برند'),
                      onSubmitted: (value) => context.read<CatalogCubit>().setSearch(value),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: state.categoryId,
                            items: [
                              const DropdownMenuItem(value: '', child: Text('همه دسته‌ها')),
                              ...state.categories.map((category) => DropdownMenuItem(value: category.id, child: Text(category.name))),
                            ],
                            onChanged: (value) => context.read<CatalogCubit>().setCategory(value ?? ''),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: state.sort,
                            items: const [
                              DropdownMenuItem(value: 'newest', child: Text('جدیدترین')),
                              DropdownMenuItem(value: 'best-selling', child: Text('پرفروش')),
                              DropdownMenuItem(value: 'price-asc', child: Text('ارزان')),
                              DropdownMenuItem(value: 'price-desc', child: Text('گران')),
                              DropdownMenuItem(value: 'rating', child: Text('امتیاز')),
                            ],
                            onChanged: (value) => context.read<CatalogCubit>().setSort(value ?? 'newest'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
                  itemCount: state.products.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: .58,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemBuilder: (context, index) => ProductCard(product: state.products[index]),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
