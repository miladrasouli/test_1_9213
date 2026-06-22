import { type FormEvent, useEffect, useState } from 'react';
import { BarChart3, FileText, HelpCircle, Home, Newspaper, Phone, ReceiptText, ShoppingBag, UserRound } from 'lucide-react';
import { api, type CategoryDto } from './api';
import { useShopStore } from './store';
import { TopHeader, Footer, type NavItem } from './components/Layout';
import { ProductDetail } from './components/ProductSections';
import { HomeView } from './pages/HomeView';
import { CartView } from './pages/CartView';
import { ProfileView } from './pages/ProfileView';
import { OrdersView } from './pages/OrdersView';
import { AdminView } from './pages/AdminView';
import { AboutView, ArticlesView, ContactView, FaqView } from './pages/PublicPages';

export function App() {
  const { activeView, setActiveView, cart, currentUser, logout } = useShopStore();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const nav: NavItem[] = [
    ['home', 'صفحه اصلی', Home],
    ['cart', `سبد خرید (${cart.length})`, ShoppingBag],
    ['profile', 'پروفایل', UserRound],
    ['orders', 'سفارش‌ها', ReceiptText],
    ['articles', 'مجله فروشگاه', Newspaper],
    ['about', 'درباره ما', FileText],
    ['contact', 'تماس با ما', Phone],
    ['faq', 'سوالات متداول', HelpCircle],
    ['admin', 'پنل مدیریت', BarChart3],
  ];

  const searchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    useShopStore.getState().setFilters({ search: query });
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
        cartCount={cart.length}
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
        {activeView === 'about' && <AboutView />}
        {activeView === 'contact' && <ContactView />}
        {activeView === 'faq' && <FaqView />}
        {activeView === 'admin' && <AdminView />}
      </main>
      <Footer />
    </div>
  );
}
