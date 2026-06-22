import type { OrderDto } from '../api';
import { money } from '../utils/shop';

export function OrderList({ orders }: { orders: OrderDto[] }) {
  return (
    <div className="order-list">
      {orders.map((order) => (
        <div className="order" key={order.id}>
          <div><strong>{order.orderNumber}</strong><span>{order.customerName}</span></div>
          <div>{money(order.grandTotal)}</div>
          <div>{order.invoice?.invoiceNumber ?? 'بدون فاکتور'}</div>
        </div>
      ))}
      {orders.length === 0 && <div className="empty-cart">سفارشی ثبت نشده است.</div>}
    </div>
  );
}
