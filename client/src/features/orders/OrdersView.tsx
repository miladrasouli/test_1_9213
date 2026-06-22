import { useEffect, useState } from 'react';
import { api, sampleUserId, type OrderDto } from '../../services/api';
import { OrderList } from './OrderList';

export function OrdersView() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  useEffect(() => { api.getOrders(sampleUserId).then(setOrders); }, []);
  return (
    <section className="page">
      <div className="section-card">
        <div className="section-heading">
          <h2>سوابق خرید</h2>
          <span>{orders.length} سفارش</span>
        </div>
        <OrderList orders={orders} />
      </div>
    </section>
  );
}
