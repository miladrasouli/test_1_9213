import { type FormEvent, useEffect, useState } from 'react';
import { BarChart3, BookOpen, FileText, HelpCircle, Home, Newspaper, Phone, ReceiptText, ShoppingBag, Tags, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api, type CategoryDto } from './api';
import { useShopStore } from './store';
import { TopHeader, Footer, type NavItem } from './components/Layout';
import { ProductDetail } from './components/ProductSections';
import { HomeView } from './pages/HomeView';
import { CartView } from './pages/CartView';
import { ProfileView } from './pages/ProfileView';
import { OrdersView } from './pages/OrdersView';
import { AdminView } from './pages/AdminView';
import { AboutView, ArticlesView, BrandsView, CatalogsView, ContactView, FaqView } from './pages/PublicPages';

export function App() {
  const { activeView, setActiveView, cart, currentUser, logout } = useShopStore();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [query, setQuery] = useState('');
  const [managedNav, setManagedNav] = useState<NavItem[]>([]);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
    api.getMenus('Header').then((items) => {
      const icons: Record<string, LucideIcon> = { BarChart3, BookOpen, FileText, HelpCircle, Home, Newspaper, Phone, ReceiptText, ShoppingBag, Tags, UserRound };
      setManagedNav(items.map((item) => [item.viewKey as NavItem[0], item.viewKey === 'cart' ? `${item.label} (${cartItemCount})` : item.label, icons[item.icon] ?? Home]));
    }).catch(() => setManagedNav([]));
  }, []);

  const fallbackNav: NavItem[] = [
    ['home', 'صفحه اصلی', Home],
    ['cart', `سبد خرید (${cartItemCount})`, ShoppingBag],
    ['profile', 'پروفایل', UserRound],
    ['orders', 'سفارش‌ها', ReceiptText],
    ['articles', 'مجله فروشگاه', Newspaper],
    ['catalogs', 'کاتالوگ‌ها', BookOpen],
    ['brands', 'برندها', Tags],
    ['about', 'درباره ما', FileText],
    ['contact', 'تماس با ما', Phone],
    ['faq', 'سوالات متداول', HelpCircle],
    ['admin', 'پنل مدیریت', BarChart3],
  ];

  const mergedNav = fallbackNav.map(([key, fallbackLabel, fallbackIcon]) => {
    const managed = managedNav.find(([managedKey]) => managedKey === key);
    const label = managed?.[1] ?? fallbackLabel;
    const Icon = managed?.[2] ?? fallbackIcon;
    return [key, key === 'cart' ? `سبد خرید (${cartItemCount})` : label, Icon] as NavItem;
  });
  const nav = mergedNav.filter(([key]) => {
    if (key === 'admin') return currentUser?.isAdmin;
    if (key === 'orders') return Boolean(currentUser);
    return true;
  });

  const searchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchText = query.trim();
    useShopStore.getState().setFilters({ search: searchText, categoryId: '' });
    setQuery('');
    setActiveView('home');
  };

  return (
    <div className="shop-shell">
      <TopHeader
        nav={nav}
        categories={categories}
        activeView={activeView}
        setActiveView={setActiveView}
        query={query}
        setQuery={setQuery}
        searchSubmit={searchSubmit}
        cartCount={cartItemCount}
        currentUser={currentUser}
        logout={logout}
      />
      <main className="main-container">
        {activeView === 'home' && <HomeView categories={categories} />}
        {activeView === 'product' && <ProductDetail />}
        {activeView === 'cart' && <CartView />}
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'orders' && <OrdersView />}
        {activeView === 'articles' && <ArticlesView />}
        {activeView === 'catalogs' && <CatalogsView />}
        {activeView === 'brands' && <BrandsView />}
        {activeView === 'about' && <AboutView />}
        {activeView === 'contact' && <ContactView />}
        {activeView === 'faq' && <FaqView />}
        {activeView === 'admin' && <AdminView />}
      </main>
      <Footer />
    </div>
  );
}
