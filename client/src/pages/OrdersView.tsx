import { useEffect, useState } from 'react';
import { api, type OrderDto } from '../api';
import { useShopStore } from '../store';
import { OrderList } from '../components/OrderList';

export function OrdersView() {
  const { currentUser, setActiveView } = useShopStore();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    api.getOrders(currentUser.id).then(setOrders);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="page">
        <div className="section-card public-panel">
          <h2>برای مشاهده سفارش‌ها وارد شوید</h2>
          <button className="primary" onClick={() => setActiveView('profile')}>ورود کاربر</button>
        </div>
      </section>
    );
  }
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
