import { FileText, MapPin, Phone } from 'lucide-react';
import { useShopStore } from '../../store/shopStore';

export function ContactView() {
  return (
    <section className="page">
      <div className="public-grid">
        <div className="section-card public-panel">
          <h1>تماس با ما</h1>
          <p>برای پیگیری سفارش، همکاری با فروشگاه یا سوال درباره محصولات از راه‌های زیر با ما در ارتباط باشید.</p>
          <div className="contact-list">
            <span><Phone size={20} /> 021-00000000</span>
            <span><MapPin size={20} /> تهران، خیابان ولیعصر، واحد پشتیبانی ShopSuite</span>
            <span><FileText size={20} /> support@shopsuite.local</span>
          </div>
        </div>
        <div className="section-card public-panel">
          <h2>ساعات پاسخگویی</h2>
          <p>شنبه تا چهارشنبه از ساعت ۹ تا ۱۸ و پنجشنبه‌ها از ساعت ۹ تا ۱۳.</p>
          <button className="primary" onClick={() => useShopStore.getState().setActiveView('faq')}>مشاهده سوالات متداول</button>
        </div>
      </div>
    </section>
  );
}
