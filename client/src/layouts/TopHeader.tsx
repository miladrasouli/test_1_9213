import type { FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LayoutGrid, Menu, Search, ShoppingBag, UserRound } from 'lucide-react';
import type { CategoryDto } from '../services/api';
import { useShopStore, type ViewKey } from '../store/shopStore';
import { asset } from '../shared/lib/assets';

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
}: {
  nav: NavItem[];
  categories: CategoryDto[];
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  query: string;
  setQuery: (value: string) => void;
  searchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  cartCount: number;
}) {
  return (
    <header className="site-header">
      <div className="top-ad" style={{ backgroundImage: `url(${asset('img/banner/large-ads.jpg')})` }} />
      <div className="header-main main-container">
        <button className="logo-button" onClick={() => setActiveView('home')} aria-label="ShopSuite">
          <img src={asset('img/logo.png')} alt="ShopSuite" />
        </button>
        <form className="search-box" onSubmit={searchSubmit}>
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="نام کالا، برند یا دسته مورد نظر خود را جستجو کنید"
          />
        </form>
        <div className="header-actions">
          <button className="account-button" onClick={() => setActiveView('profile')}>
            <UserRound size={19} />
            حساب کاربری
          </button>
          <button className="cart-button" onClick={() => setActiveView('cart')}>
            <ShoppingBag size={20} />
            <span>{cartCount}</span>
          </button>
        </div>
      </div>
      <nav className="mega-row">
        <div className="main-container nav-inner">
          <div className="category-trigger">
            <Menu size={18} />
            دسته‌بندی کالاها
            <div className="category-menu">
              {categories.map((category) => (
                <button key={category.id} onClick={() => {
                  useShopStore.getState().setFilters({ categoryId: category.id });
                  setActiveView('home');
                }}>
                  <LayoutGrid size={16} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <div className="nav-links">
            {nav.map(([key, label, Icon]) => (
              <button key={key} className={activeView === key ? 'active' : ''} onClick={() => setActiveView(key)}>
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
