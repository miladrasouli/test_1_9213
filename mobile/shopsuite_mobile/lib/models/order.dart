class Invoice {
  const Invoice({
    required this.id,
    required this.invoiceNumber,
    required this.issuedAt,
    required this.payableAmount,
  });

  final String id;
  final String invoiceNumber;
  final DateTime issuedAt;
  final double payableAmount;

  factory Invoice.fromJson(Map<String, dynamic> json) => Invoice(
        id: json['id'] as String,
        invoiceNumber: json['invoiceNumber'] as String,
        issuedAt: DateTime.parse(json['issuedAt'] as String),
        payableAmount: (json['payableAmount'] as num).toDouble(),
      );
}

class OrderItem {
  const OrderItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.lineTotal,
  });

  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  final double lineTotal;

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        productId: json['productId'] as String,
        productName: json['productName'] as String,
        quantity: json['quantity'] as int,
        unitPrice: (json['unitPrice'] as num).toDouble(),
        lineTotal: (json['lineTotal'] as num).toDouble(),
      );
}

class Order {
  const Order({
    required this.id,
    required this.orderNumber,
    required this.userId,
    required this.customerName,
    required this.status,
    required this.paymentStatus,
    required this.grandTotal,
    required this.createdAt,
    required this.items,
    this.invoice,
  });

  final String id;
  final String orderNumber;
  final String userId;
  final String customerName;
  final int status;
  final int paymentStatus;
  final double grandTotal;
  final DateTime createdAt;
  final List<OrderItem> items;
  final Invoice? invoice;

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as String,
        orderNumber: json['orderNumber'] as String,
        userId: json['userId'] as String,
        customerName: json['customerName'] as String? ?? '',
        status: json['status'] as int,
        paymentStatus: json['paymentStatus'] as int,
        grandTotal: (json['grandTotal'] as num).toDouble(),
        createdAt: DateTime.parse(json['createdAt'] as String),
        items: (json['items'] as List<dynamic>)
            .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
            .toList(),
        invoice: json['invoice'] == null
            ? null
            : Invoice.fromJson(json['invoice'] as Map<String, dynamic>),
      );
}
