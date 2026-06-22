import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/shop_repository.dart';
import 'catalog_state.dart';

class CatalogCubit extends Cubit<CatalogState> {
  CatalogCubit(this._repository) : super(const CatalogState());

  final ShopRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(status: CatalogStatus.loading));
    try {
      final categories = await _repository.getCategories();
      final products = await _repository.getProducts(
        categoryId: state.categoryId,
        search: state.search,
        sort: state.sort,
      );
      emit(state.copyWith(
        status: CatalogStatus.ready,
        categories: categories,
        products: products,
      ));
    } catch (error) {
      emit(state.copyWith(status: CatalogStatus.failure, error: error.toString()));
    }
  }

  Future<void> setCategory(String categoryId) async {
    emit(state.copyWith(categoryId: categoryId));
    await load();
  }

  Future<void> setSearch(String search) async {
    emit(state.copyWith(search: search));
    await load();
  }

  Future<void> setSort(String sort) async {
    emit(state.copyWith(sort: sort));
    await load();
  }
}
