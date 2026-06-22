import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'blocs/cart/cart_cubit.dart';
import 'blocs/catalog/catalog_cubit.dart';
import 'blocs/profile/profile_cubit.dart';
import 'blocs/shop_home/shop_home_cubit.dart';
import 'data/shop_repository.dart';
import 'ui/home_shell.dart';
import 'ui/theme.dart';

class ShopSuiteMobileApp extends StatelessWidget {
  const ShopSuiteMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    final repository = context.read<ShopRepository>();

    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => ShopHomeCubit(repository)..load()),
        BlocProvider(create: (_) => CatalogCubit(repository)..load()),
        BlocProvider(create: (_) => CartCubit(repository)),
        BlocProvider(create: (_) => ProfileCubit(repository)..load()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'ShopSuite',
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        theme: buildShopTheme(),
        home: const Directionality(
          textDirection: TextDirection.rtl,
          child: HomeShell(),
        ),
      ),
    );
  }
}
