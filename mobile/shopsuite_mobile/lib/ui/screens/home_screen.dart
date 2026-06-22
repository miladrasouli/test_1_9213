import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/shop_home/shop_home_cubit.dart';
import '../../blocs/shop_home/shop_home_state.dart';
import '../formatters.dart';
import '../widgets/empty_state.dart';
import '../widgets/product_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () => context.read<ShopHomeCubit>().load(),
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            title: const Text('ShopSuite'),
            actions: [
              IconButton(
                tooltip: 'بروزرسانی',
                onPressed: () => context.read<ShopHomeCubit>().load(),
                icon: const Icon(Icons.refresh),
              ),
            ],
          ),
          BlocBuilder<ShopHomeCubit, ShopHomeState>(
            builder: (context, state) {
              if (state.status == ShopHomeStatus.loading) {
                return const SliverFillRemaining(child: Center(child: CircularProgressIndicator()));
              }
              if (state.status == ShopHomeStatus.failure) {
                return SliverFillRemaining(
                  child: EmptyState(icon: Icons.cloud_off, title: 'اتصال برقرار نشد', message: state.error),
                );
              }

              final hero = state.bestSellers.isEmpty ? null : state.bestSellers.first;
              return SliverList(
                delegate: SliverChildListDelegate([
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Stack(
                        alignment: Alignment.bottomRight,
                        children: [
                          Image.asset('assets/didikala/img/main-slider/1.jpg', height: 190, width: double.infinity, fit: BoxFit.cover),
                          if (hero != null)
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16),
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [Colors.transparent, Color(0xaa000000)],
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Text('پرفروش امروز', style: TextStyle(color: Colors.white70)),
                                  Text(hero.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white, fontWeight: FontWeight.w900)),
                                  Text(money(hero.price), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                    child: Text('پرفروش‌ترین‌ها', style: Theme.of(context).textTheme.titleLarge),
                  ),
                ]),
              );
            },
          ),
          BlocBuilder<ShopHomeCubit, ShopHomeState>(
            builder: (context, state) {
              return SliverPadding(
                padding: const EdgeInsets.all(12),
                sliver: SliverGrid.builder(
                  itemCount: state.bestSellers.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: .58,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemBuilder: (context, index) => ProductCard(product: state.bestSellers[index]),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
