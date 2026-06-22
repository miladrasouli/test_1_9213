import 'package:intl/intl.dart';

final _moneyFormatter = NumberFormat.decimalPattern('fa');

String money(num value) => '${_moneyFormatter.format(value)} تومان';
