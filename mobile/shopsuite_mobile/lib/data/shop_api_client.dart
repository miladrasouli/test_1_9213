import 'package:dio/dio.dart';

import '../config/app_config.dart';

class ShopApiClient {
  ShopApiClient({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: AppConfig.apiBaseUrl,
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 15),
                headers: {'Content-Type': 'application/json'},
              ),
            );

  final Dio _dio;

  Future<List<dynamic>> getList(String path, {Map<String, dynamic>? query}) async {
    final response = await _dio.get<Object?>(path, queryParameters: query);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getMap(String path, {Map<String, dynamic>? query}) async {
    final response = await _dio.get<Object?>(path, queryParameters: query);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> postMap(String path, Map<String, dynamic> data) async {
    final response = await _dio.post<Object?>(path, data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<void> put(String path, Map<String, dynamic> data) async {
    await _dio.put<Object?>(path, data: data);
  }
}
