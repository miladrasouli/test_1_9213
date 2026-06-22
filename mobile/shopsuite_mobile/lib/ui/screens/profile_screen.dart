import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/profile/profile_cubit.dart';
import '../../blocs/profile/profile_state.dart';
import '../formatters.dart';
import '../widgets/empty_state.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('پروفایل'),
        actions: [
          IconButton(
            tooltip: 'بروزرسانی',
            onPressed: () => context.read<ProfileCubit>().load(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: BlocBuilder<ProfileCubit, ProfileState>(
        builder: (context, state) {
          if (state.status == ProfileStatus.loading && state.profile == null) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == ProfileStatus.failure) {
            return EmptyState(icon: Icons.error_outline, title: 'خطا در دریافت پروفایل', message: state.error);
          }

          final profile = state.profile;
          if (profile == null) {
            return const EmptyState(icon: Icons.person_outline, title: 'پروفایل پیدا نشد');
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.person)),
                  title: Text(profile.fullName),
                  subtitle: Text('${profile.email}\n${profile.phoneNumber}'),
                  isThreeLine: true,
                  trailing: IconButton(
                    icon: const Icon(Icons.edit),
                    onPressed: () => _showProfileSheet(context, profile.fullName, profile.email, profile.phoneNumber),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: Text('آدرس‌ها', style: Theme.of(context).textTheme.titleLarge)),
                  TextButton.icon(
                    onPressed: () => _showAddressSheet(context),
                    icon: const Icon(Icons.add_location_alt_outlined),
                    label: const Text('افزودن'),
                  ),
                ],
              ),
              ...profile.addresses.map(
                (address) => Card(
                  child: ListTile(
                    leading: Icon(address.isDefault ? Icons.home : Icons.location_on_outlined),
                    title: Text(address.title),
                    subtitle: Text('${address.province}، ${address.city}، ${address.street}'),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text('سوابق خرید', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              ...state.orders.map(
                (order) => Card(
                  child: ExpansionTile(
                    title: Text(order.orderNumber),
                    subtitle: Text(order.invoice?.invoiceNumber ?? 'بدون فاکتور'),
                    trailing: Text(money(order.grandTotal), style: const TextStyle(fontWeight: FontWeight.bold)),
                    children: order.items
                        .map((item) => ListTile(
                              title: Text(item.productName),
                              subtitle: Text('تعداد ${item.quantity}'),
                              trailing: Text(money(item.lineTotal)),
                            ))
                        .toList(),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showProfileSheet(BuildContext context, String fullName, String email, String phoneNumber) {
    final nameController = TextEditingController(text: fullName);
    final emailController = TextEditingController(text: email);
    final phoneController = TextEditingController(text: phoneNumber);

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'نام کامل')),
            const SizedBox(height: 10),
            TextField(controller: emailController, decoration: const InputDecoration(labelText: 'ایمیل')),
            const SizedBox(height: 10),
            TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'شماره تماس')),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  context.read<ProfileCubit>().saveProfile(
                        fullName: nameController.text,
                        email: emailController.text,
                        phoneNumber: phoneController.text,
                      );
                  Navigator.pop(context);
                },
                child: const Text('ذخیره'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddressSheet(BuildContext context) {
    final controllers = {
      'title': TextEditingController(),
      'province': TextEditingController(),
      'city': TextEditingController(),
      'street': TextEditingController(),
      'postalCode': TextEditingController(),
      'receiverName': TextEditingController(),
      'receiverPhone': TextEditingController(),
    };

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 16),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final entry in controllers.entries) ...[
                TextField(controller: entry.value, decoration: InputDecoration(labelText: _addressLabel(entry.key))),
                const SizedBox(height: 10),
              ],
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () {
                    context.read<ProfileCubit>().addAddress({
                      for (final entry in controllers.entries) entry.key: entry.value.text,
                      'isDefault': false,
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('ثبت آدرس'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _addressLabel(String key) {
    return switch (key) {
      'title' => 'عنوان',
      'province' => 'استان',
      'city' => 'شهر',
      'street' => 'نشانی',
      'postalCode' => 'کد پستی',
      'receiverName' => 'نام گیرنده',
      'receiverPhone' => 'شماره گیرنده',
      _ => key,
    };
  }
}
