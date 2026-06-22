import { useState } from 'react';
import { api } from '../api';
import { useShopStore } from '../store';
import { money, productImage } from '../utils/shop';

export function CartView() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, currentUser, setActiveView } = useShopStore();
  const [message, setMessage] = useState('');
  const submitOrder = async () => {
    if (!currentUser) {
      setMessage('برای ثبت سفارش ابتدا وارد حساب کاربری شوید.');
      setActiveView('profile');
      return;
    }

    const order = await api.createOrder({
      userId: currentUser.id,
      addressId: null,
      notes: 'ثبت از فرانت React TypeScript بر اساس قالب didikala',
      items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
    });
    clearCart();
    setMessage(`سفارش ${order.orderNumber} ثبت شد. شماره فاکتور: ${order.invoice?.invoiceNumber}`);
  };

  return (
    <section className="page cart-layout">
      <div className="section-card">
        <div className="section-heading">
          <h2>سبد خرید</h2>
          <span>{cart.length} کالا</span>
        </div>
        <div className="cart-list">
          {cart.map((item, index) => (
            <div className="cart-item" key={item.id}>
              <img src={productImage(item, index)} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>{item.shortDescription}</p>
                <span>قیمت واحد: {money(item.price)}</span>
              </div>
              <input type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value))} />
              <strong>{money(item.price * item.quantity)}</strong>
              <button onClick={() => removeFromCart(item.id)}>حذف</button>
            </div>
          ))}
          {cart.length === 0 && <div className="empty-cart">سبد خرید شما خالی است.</div>}
        </div>
      </div>
      <aside className="summary-box">
        <span>مبلغ قابل پرداخت</span>
        <strong>{money(cartTotal())}</strong>
        <button className="danger" disabled={cart.length === 0} onClick={submitOrder}>ثبت سفارش و صدور فاکتور</button>
        {message && <p className="success">{message}</p>}
      </aside>
    </section>
  );
}
