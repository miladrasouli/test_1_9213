import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/cart/cart_cubit.dart';
import '../../blocs/cart/cart_state.dart';
import '../formatters.dart';
import '../widgets/empty_state.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<CartCubit, CartState>(
      listenWhen: (previous, current) => previous.status != current.status,
      listener: (context, state) {
        if (state.status == CartStatus.success && state.lastOrder != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('سفارش ${state.lastOrder!.orderNumber} ثبت شد')),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('سبد خرید')),
        body: BlocBuilder<CartCubit, CartState>(
          builder: (context, state) {
            if (state.items.isEmpty) {
              return const EmptyState(
                icon: Icons.shopping_bag_outlined,
                title: 'سبد خرید خالی است',
                message: 'از صفحه محصولات، کالای موردنظرت را اضافه کن.',
              );
            }

            return Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: state.items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = state.items[index];
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.product.name, style: Theme.of(context).textTheme.titleMedium),
                                    const SizedBox(height: 6),
                                    Text(money(item.lineTotal), style: const TextStyle(fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: () => context.read<CartCubit>().decrement(item.product.id),
                                icon: const Icon(Icons.remove_circle_outline),
                              ),
                              Text(item.quantity.toString()),
                              IconButton(
                                onPressed: () => context.read<CartCubit>().increment(item.product.id),
                                icon: const Icon(Icons.add_circle_outline),
                              ),
                              IconButton(
                                onPressed: () => context.read<CartCubit>().remove(item.product.id),
                                icon: const Icon(Icons.delete_outline),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                SafeArea(
                  top: false,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      border: Border(top: BorderSide(color: Color(0xffdfe6ef))),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('جمع کل'),
                              Text(money(state.total), style: Theme.of(context).textTheme.titleLarge),
                            ],
                          ),
                        ),
                        FilledButton(
                          onPressed: state.status == CartStatus.submitting ? null : () => context.read<CartCubit>().submit(),
                          child: state.status == CartStatus.submitting
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Text('ثبت سفارش'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
