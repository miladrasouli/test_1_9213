import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/shop_repository.dart';
import 'shop_home_state.dart';

class ShopHomeCubit extends Cubit<ShopHomeState> {
  ShopHomeCubit(this._repository) : super(const ShopHomeState());

  final ShopRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(status: ShopHomeStatus.loading));
    try {
      final bestSellers = await _repository.getBestSellers();
      emit(state.copyWith(status: ShopHomeStatus.ready, bestSellers: bestSellers));
    } catch (error) {
      emit(state.copyWith(status: ShopHomeStatus.failure, error: error.toString()));
    }
  }
}
