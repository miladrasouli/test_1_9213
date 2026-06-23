import { useState } from 'react';
import type { OrderDto } from '../api';
import { money } from '../utils/shop';

const statusText = (value: number) => ['در انتظار بررسی', 'در حال پردازش', 'ارسال شده', 'تحویل شده', 'لغو شده'][value] ?? String(value);
const paymentText = (value: number) => ['در انتظار پرداخت', 'پرداخت شده', 'ناموفق', 'برگشت خورده'][value] ?? String(value);
const formatDate = (value: string) => new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function OrderList({ orders }: { orders: OrderDto[] }) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? '');

  return (
    <div className="order-list invoice-list">
      {orders.map((order) => {
        const isOpen = selectedOrderId === order.id;

        return (
          <article className={isOpen ? 'order invoice-order open' : 'order invoice-order'} key={order.id}>
            <button type="button" className="invoice-summary" onClick={() => setSelectedOrderId(isOpen ? '' : order.id)}>
              <div className="invoice-title">
                <strong>{order.invoice?.invoiceNumber ?? `پیش‌فاکتور ${order.orderNumber}`}</strong>
                <span>{order.customerName}</span>
              </div>
              <div className="invoice-meta">
                <span>شماره سفارش: {order.orderNumber}</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="invoice-status">
                <span>{statusText(order.status)}</span>
                <span>{paymentText(order.paymentStatus)}</span>
              </div>
              <strong className="invoice-total">{money(order.grandTotal)}</strong>
            </button>

            {isOpen && (
              <div className="invoice-detail">
                <div className="invoice-detail-grid">
                  <div><span>جمع کالاها</span><strong>{money(order.subtotal)}</strong></div>
                  <div><span>هزینه ارسال</span><strong>{money(order.shippingCost)}</strong></div>
                  <div><span>تخفیف</span><strong>{money(order.discountTotal)}</strong></div>
                  <div><span>مالیات</span><strong>{money(order.taxTotal)}</strong></div>
                  <div><span>قابل پرداخت</span><strong>{money(order.invoice?.payableAmount ?? order.grandTotal)}</strong></div>
                </div>

                <div className="invoice-items">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.productId}`}>
                      <span>{item.productName}</span>
                      <small>{item.quantity} عدد × {money(item.unitPrice)}</small>
                      <strong>{money(item.lineTotal)}</strong>
                    </div>
                  ))}
                </div>

                {order.invoice && (
                  <div className="invoice-note">
                    <span>فاکتور مشتری: {order.invoice.invoiceNumber}</span>
                    <span>تاریخ صدور: {formatDate(order.invoice.issuedAt)}</span>
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
      {orders.length === 0 && <div className="empty-cart">سفارشی ثبت نشده است.</div>}
    </div>
  );
}
