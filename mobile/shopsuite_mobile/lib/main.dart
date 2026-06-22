import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'app.dart';
import 'data/shop_api_client.dart';
import 'data/shop_repository.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  final repository = ShopRepository(ShopApiClient());

  runApp(
    RepositoryProvider.value(
      value: repository,
      child: const ShopSuiteMobileApp(),
    ),
  );
}
