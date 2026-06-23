import { useEffect, useState, type FormEvent } from 'react';
import {
  ChevronLeft,
  ChevronUp,
  CreditCard,
  Headphones,
  Instagram,
  LayoutGrid,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Phone,
  ReceiptText,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api, type AuthUserDto, type CategoryDto, type FooterSectionDto, type SiteSettingsDto } from '../api';
import { useShopStore, type ViewKey } from '../store';
import { asset } from '../utils/shop';

export type NavItem = [ViewKey, string, LucideIcon];

export function TopHeader({
  nav,
  categories,
  activeView,
  setActiveView,
  query,
  setQuery,
  searchSubmit,
  cartCount,
  currentUser,
  logout,
}: {
  nav: NavItem[];
  categories: CategoryDto[];
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  query: string;
  setQuery: (value: string) => void;
  searchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  cartCount: number;
  currentUser: AuthUserDto | null;
  logout: () => void;
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsDto>({
    topBannerImageUrl: asset('img/banner/large-ads.jpg'),
    topBannerLink: '',
    topBannerAlt: 'بنر بالای فروشگاه',
    bestSellerTake: 8,
  });
  const categoryPreview = categories.slice(0, 7);
  const megaGroups = [
    ['پیشنهادهای ویژه', 'پرفروش‌ترین‌ها', 'جدیدترین کالاها', 'تخفیف‌های امروز'],
    ['برندها', 'سامسونگ', 'اپل', 'شیائومی', 'ایسوس'],
    ['خدمات فروشگاه', 'ارسال سریع', 'ضمانت اصالت کالا', 'پرداخت امن'],
  ];
  const bannerImage = settings.topBannerImageUrl || asset('img/banner/large-ads.jpg');

  useEffect(() => {
    api.getSiteSettings().then(setSettings).catch(() => undefined);
  }, []);

  return (
    <header className="site-header main-header">
      <button
        className="top-ad"
        type="button"
        style={{ backgroundImage: `url(${bannerImage})` }}
        aria-label={settings.topBannerAlt || 'بنر بالای فروشگاه'}
        onClick={() => {
          if (settings.topBannerLink) window.open(settings.topBannerLink, '_blank', 'noopener,noreferrer');
        }}
      />

      <div className="topbar main-container">
        <button className="logo-button logo-area" type="button" onClick={() => setActiveView('home')} aria-label="ShopSuite">
          <img src={asset('img/logo.png')} alt="ShopSuite" />
        </button>

        <form className="search-box search-area" onSubmit={searchSubmit}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="نام کالا، برند و یا دسته مورد نظر خود را جستجو کنید..."
          />
          <button className="search-submit-button" type="submit" aria-label="جستجو">
            <Search size={19} />
          </button>
          {query && (
            <div className="search-result">
              <button type="submit">جستجو برای «{query}»</button>
              {categoryPreview.slice(0, 3).map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => {
                    useShopStore.getState().setFilters({ categoryId: category.id, search: '' });
                    setQuery('');
                    setActiveView('home');
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="topbar-left">
          <div className="account-menu">
            <button className="account-button" type="button" onClick={() => setActiveView('profile')}>
              <span>حساب کاربری</span>
              <UserRound size={20} />
            </button>
            <div className="account-dropdown">
              <button type="button" onClick={() => setActiveView('profile')}>
                <UserRound size={16} />
                پروفایل
              </button>
              {currentUser && (
                <button type="button" onClick={() => setActiveView('orders')}>
                  <ReceiptText size={16} />
                  سفارش‌ها
                </button>
              )}
              {currentUser?.isAdmin && (
                <button type="button" onClick={() => setActiveView('admin')}>
                  <ShieldCheck size={16} />
                  پنل مدیریت
                </button>
              )}
              {currentUser && (
                <button type="button" onClick={logout}>
                  <LogOut size={16} />
                  خروج ({currentUser.role})
                </button>
              )}
              {!currentUser && (
                <button type="button" onClick={() => setActiveView('profile')}>
                  <LogIn size={16} />
                  ورود / ثبت‌نام
                </button>
              )}
            </div>
          </div>

          <div className="cart-menu">
            <button className="cart-button" type="button" onClick={() => setActiveView('cart')}>
              <ShoppingBag size={20} />
              <span>{cartCount}</span>
            </button>
            <div className="cart-dropdown">
              <strong>سبد خرید</strong>
              <p>{cartCount ? `${cartCount} کالا در سبد خرید دارید.` : 'سبد خرید شما خالی است.'}</p>
              <button type="button" onClick={() => setActiveView('cart')}>مشاهده سبد خرید</button>
            </div>
          </div>
        </div>
      </div>

      <nav className="mega-row bottom-header">
        <div className="main-container nav-inner">
          <div className={`category-trigger ${isCategoryOpen ? 'open' : ''}`} onMouseLeave={() => setIsCategoryOpen(false)}>
            <button
              className="category-trigger-button"
              type="button"
              onClick={() => setIsCategoryOpen((value) => !value)}
              aria-expanded={isCategoryOpen}
            >
              <Menu size={18} />
              دسته‌بندی کالاها
            </button>
            <div className="category-menu">
              <div className="category-list-panel">
                {(categoryPreview.length ? categoryPreview : categories).map((category, index) => (
                  <button
                    key={category.id}
                    className={index === 0 ? 'active' : ''}
                    onClick={() => {
                      useShopStore.getState().setFilters({ categoryId: category.id });
                      setActiveView('home');
                      setIsCategoryOpen(false);
                    }}
                  >
                    <LayoutGrid size={16} />
                    {category.name}
                  </button>
                ))}
              </div>
              <div className="category-mega-panel">
                {megaGroups.map(([title, ...items]) => (
                  <div className="mega-column" key={title}>
                    <h4>{title}</h4>
                    {items.map((item) => (
                      <button key={item} type="button" onClick={() => {
                        setActiveView('home');
                        setIsCategoryOpen(false);
                      }}>
                        <ChevronLeft size={13} />
                        {item}
                      </button>
                    ))}
                  </div>
                ))}
                <img src={asset('img/theme/mega-menu.jpg')} alt="" />
              </div>
            </div>
          </div>

          <div className="nav-links">
            {nav.map(([key, label, Icon]) => (
              <button key={key} type="button" className={activeView === key ? 'active' : ''} onClick={() => setActiveView(key)}>
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  const { setActiveView } = useShopStore();
  const [managedSections, setManagedSections] = useState<FooterSectionDto[]>([]);
  const footerColumns: Array<{ title: string; links: Array<[string, ViewKey]> }> = [
    {
      title: 'راهنمای خرید',
      links: [
        ['صفحه اصلی', 'home'],
        ['سبد خرید', 'cart'],
        ['سوالات متداول', 'faq'],
        ['تماس با ما', 'contact'],
      ],
    },
    {
      title: 'خدمات مشتریان',
      links: [
        ['پروفایل کاربری', 'profile'],
        ['سفارش‌های من', 'orders'],
        ['مجله فروشگاه', 'articles'],
        ['درباره ما', 'about'],
      ],
    },
    {
      title: 'پنل فروشگاه',
      links: [
        ['پنل مدیریت', 'admin'],
        ['ثبت محصول', 'admin'],
        ['گزارش فروش', 'admin'],
        ['مدیریت کالاها', 'admin'],
      ],
    },
  ];
  const columns = managedSections.length
    ? managedSections.map((section) => ({
        title: section.title,
        links: section.links.map((link) => [link.label, link.viewKey as ViewKey] as [string, ViewKey]),
      }))
    : footerColumns;

  useEffect(() => {
    api.getFooter().then(setManagedSections).catch(() => setManagedSections([]));
  }, []);

  return (
    <footer className="site-footer main-footer">
      <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <ChevronUp size={18} />
        بازگشت به بالا
      </button>

      <div className="main-container footer-services">
        {[
          [Truck, 'ارسال سریع'],
          [RotateCcw, '۷ روز ضمانت بازگشت'],
          [CreditCard, 'پرداخت امن'],
          [ShieldCheck, 'ضمانت اصالت کالا'],
          [Headphones, 'پشتیبانی آنلاین'],
        ].map(([Icon, label]) => (
          <div className="footer-service" key={label as string}>
            <Icon size={30} />
            <span>{label as string}</span>
          </div>
        ))}
      </div>

      <div className="main-container footer-widgets">
        {columns.map((column) => (
          <section className="footer-widget" key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map(([label, view]) => (
              <button key={`${column.title}-${label}`} type="button" onClick={() => setActiveView(view)}>
                {label}
              </button>
            ))}
          </section>
        ))}

        <section className="footer-newsletter">
          <h3>همراه ShopSuite باشید</h3>
          <p>تازه‌ترین تخفیف‌ها، خبرها و کالاهای پرفروش را دریافت کنید.</p>
          <form onSubmit={(event) => event.preventDefault()}>
            <input type="email" placeholder="ایمیل شما" />
            <button type="submit"><Send size={17} /> ثبت</button>
          </form>
          <div className="footer-socials">
            <button type="button" aria-label="Instagram"><Instagram size={18} /></button>
            <button type="button" aria-label="Telegram"><Send size={18} /></button>
            <button type="button" aria-label="Support"><Headphones size={18} /></button>
          </div>
        </section>
      </div>

      <div className="main-container footer-info">
        <div className="footer-description">
          <img src={asset('img/logo.png')} alt="ShopSuite" />
          <h3>فروشگاه اینترنتی ShopSuite</h3>
          <p>
            نمونه فروشگاه کامل ساخته‌شده با ASP.NET Core Web API، EF Core، SQL Server، React TypeScript،
            Zustand، React Hook Form و اپلیکیشن Flutter. این فوتر بر اساس ساختار قالب didikala طراحی شده است.
          </p>
          <div className="footer-contact">
            <span><Phone size={16} /> ۰۲۱-۱۲۳۴۵۶۷۸</span>
            <span><Mail size={16} /> support@shopsuite.local</span>
            <span><MapPin size={16} /> تهران، مرکز پردازش سفارش‌ها</span>
          </div>
        </div>

        <div className="footer-symbols">
          <div><PackageCheck size={34} /><span>نماد اعتماد</span></div>
          <div><ShieldCheck size={34} /><span>پرداخت امن</span></div>
          <div><Truck size={34} /><span>ارسال سریع</span></div>
        </div>
      </div>

      <div className="footer-copyright">
        <div className="main-container">
          <span>تمام حقوق این فروشگاه برای ShopSuite محفوظ است.</span>
          <span>نسخه وب، بک‌اند و موبایل هماهنگ با آخرین تغییرات پروژه</span>
        </div>
      </div>
    </footer>
  );
}
