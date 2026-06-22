import { useEffect, useState } from 'react';
import { FileText, MapPin, Phone, ReceiptText, ShieldCheck, Truck, UserRound } from 'lucide-react';
import { api, type ArticleDto } from '../api';
import { useShopStore } from '../store';
import { asset } from '../utils/shop';

export function ArticlesView() {
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  useEffect(() => { api.getArticles().then(setArticles); }, []);
  return (
    <section className="page">
      <div className="section-card">
        <div className="section-heading">
          <h2>مجله فروشگاه</h2>
          <span>اخبار و راهنمای خرید</span>
        </div>
        <div className="article-grid">
          {articles.map((article, index) => (
            <article className="article-card" key={article.id}>
              <img src={article.coverImageUrl?.startsWith('http') ? article.coverImageUrl : asset(`img/post-thumbnail/${(index % 5) + 1}.png`)} alt={article.title} />
              <div>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutView() {
  const [about, setAbout] = useState<{ title: string; body: string; supportPhone: string; email: string } | null>(null);
  useEffect(() => { api.getAbout().then(setAbout); }, []);
  return (
    <section className="page">
      <div className="about-cover" style={{ backgroundImage: `url(${asset('img/theme/page-cover.jpg')})` }}>
        <h1>{about?.title ?? 'درباره ShopSuite'}</h1>
        <p>{about?.body}</p>
      </div>
      <div className="service-row wide">
        <span><ShieldCheck size={20} /> ضمانت اصالت</span>
        <span><Truck size={20} /> ارسال سریع</span>
        <span><ReceiptText size={20} /> فاکتور رسمی</span>
        <span><UserRound size={20} /> پشتیبانی مشتریان</span>
      </div>
    </section>
  );
}

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

export function FaqView() {
  const items = [
    ['چطور کالا ثبت می‌شود؟', 'از پنل مدیریت وارد بخش ثبت محصول شوید، دسته‌بندی، نام، قیمت، موجودی و تصویر را وارد کنید و دکمه ثبت محصول را بزنید.'],
    ['چطور جزئیات محصول دیده می‌شود؟', 'روی تصویر، نام کالا یا دکمه مشاهده جزئیات در کارت محصول کلیک کنید.'],
    ['آیا داده‌ها واقعی در SQL Server ذخیره می‌شوند؟', 'بله، API اکنون به دیتابیس ShopSuiteDb روی SQL Server لوکال وصل است.'],
    ['ثبت سفارش چه کاری انجام می‌دهد؟', 'سفارش، آیتم‌های سفارش و فاکتور در بک‌اند ثبت می‌شوند و موجودی محصول کاهش پیدا می‌کند.'],
  ];

  return (
    <section className="page">
      <div className="section-card">
        <div className="section-heading">
          <h2>سوالات متداول</h2>
          <span>راهنمای استفاده از فروشگاه</span>
        </div>
        <div className="faq-list">
          {items.map(([question, answer]) => (
            <details key={question} open>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
