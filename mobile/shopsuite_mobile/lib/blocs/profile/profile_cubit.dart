import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/shop_repository.dart';
import 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit(this._repository) : super(const ProfileState());

  final ShopRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(status: ProfileStatus.loading));
    try {
      final profile = await _repository.getProfile();
      final orders = await _repository.getOrders();
      emit(state.copyWith(status: ProfileStatus.ready, profile: profile, orders: orders));
    } catch (error) {
      emit(state.copyWith(status: ProfileStatus.failure, error: error.toString()));
    }
  }

  Future<void> saveProfile({
    required String fullName,
    required String email,
    required String phoneNumber,
  }) async {
    emit(state.copyWith(status: ProfileStatus.saving));
    try {
      await _repository.updateProfile(fullName: fullName, email: email, phoneNumber: phoneNumber);
      await load();
    } catch (error) {
      emit(state.copyWith(status: ProfileStatus.failure, error: error.toString()));
    }
  }

  Future<void> addAddress(Map<String, dynamic> payload) async {
    emit(state.copyWith(status: ProfileStatus.saving));
    try {
      await _repository.addAddress(payload: payload);
      await load();
    } catch (error) {
      emit(state.copyWith(status: ProfileStatus.failure, error: error.toString()));
    }
  }
}
