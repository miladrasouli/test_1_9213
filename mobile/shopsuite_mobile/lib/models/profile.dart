class Address {
  const Address({
    required this.id,
    required this.title,
    required this.province,
    required this.city,
    required this.street,
    required this.postalCode,
    required this.receiverName,
    required this.receiverPhone,
    required this.isDefault,
  });

  final String id;
  final String title;
  final String province;
  final String city;
  final String street;
  final String postalCode;
  final String receiverName;
  final String receiverPhone;
  final bool isDefault;

  factory Address.fromJson(Map<String, dynamic> json) => Address(
        id: json['id'] as String,
        title: json['title'] as String,
        province: json['province'] as String,
        city: json['city'] as String,
        street: json['street'] as String,
        postalCode: json['postalCode'] as String,
        receiverName: json['receiverName'] as String,
        receiverPhone: json['receiverPhone'] as String,
        isDefault: json['isDefault'] as bool,
      );
}

class UserProfile {
  const UserProfile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    required this.isAdmin,
    required this.addresses,
  });

  final String id;
  final String fullName;
  final String email;
  final String phoneNumber;
  final bool isAdmin;
  final List<Address> addresses;

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        email: json['email'] as String,
        phoneNumber: json['phoneNumber'] as String,
        isAdmin: json['isAdmin'] as bool,
        addresses: (json['addresses'] as List<dynamic>)
            .map((item) => Address.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
}
