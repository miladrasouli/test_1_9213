import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Download, ExternalLink, FileText, MapPin, Phone, ReceiptText, Search, ShieldCheck, Tags, Truck, UserRound } from 'lucide-react';
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
              <img src={article.coverImageUrl?.startsWith('http') ? article.coverImageUrl : asset('img/post-thumbnail/' + ((index % 5) + 1) + '.png')} alt={article.title} />
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
      <div className="about-cover" style={{ backgroundImage: 'url(' + asset('img/theme/page-cover.jpg') + ')' }}>
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
    ['چطور کالا ثبت می‌شود؟', 'مدیر سایت از پنل مدیریت وارد بخش محصولات می‌شود، دسته‌بندی، نام، قیمت، موجودی، تصاویر و مشخصات محصول را ثبت می‌کند.'],
    ['چطور جزئیات محصول دیده می‌شود؟', 'روی تصویر، نام کالا یا دکمه مشاهده جزئیات در کارت محصول کلیک کنید تا گالری، مشخصات و محصولات مشابه نمایش داده شود.'],
    ['آیا داده‌ها در SQL Server ذخیره می‌شوند؟', 'بله، API به دیتابیس SQL Server متصل است و محصولات، سفارش‌ها، کاربران و تنظیمات سایت در دیتابیس ذخیره می‌شوند.'],
    ['حساب کاربری جدید چه زمانی فعال می‌شود؟', 'کاربر ثبت‌نام می‌کند، سپس مدیر سایت از بخش کاربران نقش او را تعیین و حساب را فعال می‌کند.'],
    ['ثبت سفارش چه کاری انجام می‌دهد؟', 'سفارش، آیتم‌های سفارش و فاکتور در بک‌اند ثبت می‌شوند و موجودی محصول کاهش پیدا می‌کند.'],
  ];

  return (
    <section className="page">
      <div className="section-card faq-page-card">
        <div className="section-heading">
          <h2>سوالات متداول</h2>
          <span>راهنمای استفاده از فروشگاه</span>
        </div>
        <div className="faq-list">
          {items.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const catalogGroups = [
  { title: 'ابزارهای برقی و شارژی', description: 'کاتالوگ محصولات پرفروش برقی، شارژی، دریل، فرز و تجهیزات کارگاهی.', count: 42, image: 'img/banner/medium-banner-1.jpg', items: ['دریل و پیچ‌گوشتی', 'فرز و پولیش', 'اره و برش', 'کارواش و دمنده'] },
  { title: 'لوازم جانبی ابزار', description: 'راهنمای انتخاب متعلقات مصرفی، صفحه برش، مته، سنباده و قطعات یدکی.', count: 58, image: 'img/banner/medium-banner-2.jpg', items: ['مته و سری', 'صفحه سنگ', 'سنباده', 'چسب و اسپری'] },
  { title: 'ابزارهای دستی و عمومی', description: 'کاتالوگ ابزارهای کاربردی روزمره برای خانه، کارگاه و پروژه‌های صنعتی.', count: 36, image: 'img/banner/small-banner-3.jpg', items: ['آچار و انبر', 'چکش و کاتر', 'جعبه ابزار', 'ابزار اندازه‌گیری'] },
  { title: 'تجهیزات ایمنی و کارگاهی', description: 'کاتالوگ تجهیزات ایمنی، انبار، گاراژ و ابزارهای حرفه‌ای کارگاهی.', count: 24, image: 'img/banner/small-banner-4.jpg', items: ['لباس کار', 'دستکش و عینک', 'جک و بالابر', 'تجهیزات جوشکاری'] },
];

export function CatalogsView() {
  return (
    <section className="page catalog-page">
      <div className="catalog-hero section-card">
        <div>
          <BookOpen size={34} />
          <h1>کاتالوگ محصولات</h1>
          <p>آرشیو کاتالوگ‌های فروشگاه بر اساس گروه کالا، مشابه صفحه کاتالوگ‌های ابزارمارکت.</p>
        </div>
        <button className="primary" type="button"><Download size={18} /> دانلود همه کاتالوگ‌ها</button>
      </div>
      <div className="catalog-grid">
        {catalogGroups.map((group) => (
          <article className="catalog-card" key={group.title}>
            <img src={asset(group.image)} alt={group.title} />
            <div>
              <span>{group.count} فایل و دسته</span>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
              <div className="catalog-tags">
                {group.items.map((item) => <button type="button" key={item}>{item}</button>)}
              </div>
              <button type="button" className="secondary"><Download size={16} /> دریافت کاتالوگ</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const brands = [
  ['Nova', 'موبایل و لوازم دیجیتال', 'N'],
  ['Orion', 'لپ‌تاپ و تجهیزات دیجیتال', 'O'],
  ['Urban', 'پوشاک و کفش', 'U'],
  ['Barista', 'خانه و آشپزخانه', 'B'],
  ['Ronix', 'ابزارآلات صنعتی', 'R'],
  ['Bosch', 'ابزار برقی', 'B'],
  ['Makita', 'ابزار شارژی', 'M'],
  ['Dewalt', 'ابزار حرفه‌ای', 'D'],
  ['Stanley', 'ابزار دستی', 'S'],
  ['Knipex', 'انبر و ابزار دستی', 'K'],
];

export function BrandsView() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => brands.filter(([name, group]) => (name + ' ' + group).toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <section className="page brands-page">
      <div className="section-card brands-header">
        <div>
          <Tags size={32} />
          <h1>برندها</h1>
          <p>مرور برندهای فروشگاه بر اساس نام و گروه کالا، با ساختاری شبیه صفحه برندهای ابزارمارکت.</p>
        </div>
        <label className="brand-search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجوی برند" />
        </label>
      </div>
      <div className="brand-grid">
        {filtered.map(([name, group, letter]) => (
          <button type="button" className="brand-card" key={name} onClick={() => {
            useShopStore.getState().setFilters({ search: name, categoryId: '' });
            useShopStore.getState().setActiveView('home');
          }}>
            <span>{letter}</span>
            <strong>{name}</strong>
            <small>{group}</small>
            <ExternalLink size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}
