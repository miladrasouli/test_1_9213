import 'package:flutter_test/flutter_test.dart';
import 'package:shopsuite_mobile/ui/formatters.dart';

void main() {
  test('money formats toman values in Persian locale', () {
    expect(money(1250000), contains('تومان'));
    expect(money(1250000), contains('۱٬۲۵۰٬۰۰۰'));
  });
}
