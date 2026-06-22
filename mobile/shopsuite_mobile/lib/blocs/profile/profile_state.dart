import 'package:equatable/equatable.dart';

import '../../models/order.dart';
import '../../models/profile.dart';

enum ProfileStatus { initial, loading, ready, saving, failure }

class ProfileState extends Equatable {
  const ProfileState({
    this.status = ProfileStatus.initial,
    this.profile,
    this.orders = const [],
    this.error,
  });

  final ProfileStatus status;
  final UserProfile? profile;
  final List<Order> orders;
  final String? error;

  ProfileState copyWith({
    ProfileStatus? status,
    UserProfile? profile,
    List<Order>? orders,
    String? error,
  }) =>
      ProfileState(
        status: status ?? this.status,
        profile: profile ?? this.profile,
        orders: orders ?? this.orders,
        error: error,
      );

  @override
  List<Object?> get props => [status, profile, orders, error];
}
