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
