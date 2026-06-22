import { type FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  FileText,
  HelpCircle,
  Home,
  Newspaper,
  Phone,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from 'lucide-react';
import { api } from '../services/api';
import { useShopStore } from '../store/shopStore';
import { TopHeader, type NavItem } from '../layouts/TopHeader';
import { Footer } from '../layouts/Footer';
import { HomeView } from '../features/products/pages/HomeView';
import { ProductDetail } from '../features/products/pages/ProductDetail';
import { CartView } from '../features/cart/CartView';
import { ProfileView } from '../features/profile/ProfileView';
import { OrdersView } from '../features/orders/OrdersView';
import { AdminView } from '../features/admin/AdminView';
import { AboutView, ArticlesView, ContactView, FaqView } from '../features/content';
import '../styles/global.css';

export default function App() {
  const { activeView, setActiveView, cart } = useShopStore();
  const [query, setQuery] = useState('');
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
  const categories = categoriesQuery.data ?? [];

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
