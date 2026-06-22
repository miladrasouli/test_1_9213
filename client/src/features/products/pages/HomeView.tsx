import { useQuery } from '@tanstack/react-query';
import type { CategoryDto } from '../../../services/api';
import { api } from '../../../services/api';
import { useShopStore } from '../../../store/shopStore';
import { asset } from '../../../shared/lib/assets';
import { CategoryStrip } from '../../categories/CategoryStrip';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { ProductRail } from '../components/ProductRail';

export function HomeView({ categories }: { categories: CategoryDto[] }) {
  const { filters, setFilters } = useShopStore();
  const productsQuery = useQuery({ queryKey: ['products', filters], queryFn: () => api.getProducts(filters) });
  const bestSellersQuery = useQuery({ queryKey: ['best-sellers'], queryFn: api.getBestSellers });
  const products = productsQuery.data?.items ?? [];
  const bestSellers = bestSellersQuery.data ?? [];

  return (
    <section className="page">
      <div className="home-layout">
        <aside className="home-sidebar">
          <img src={asset('img/banner/sidebar-banner-1.gif')} alt="پیشنهاد ویژه" />
          <img src={asset('img/banner/sidebar-banner-2.jpg')} alt="بنر فروشگاه" />
        </aside>
        <div className="home-content">
          <Hero />
          <CategoryStrip categories={categories} />
        </div>
      </div>

      <section className="amazing-section">
        <div className="amazing-title">
          <img src={asset('img/theme/amazing.svg')} alt="" />
          <div>
            <span>پیشنهاد شگفت‌انگیز</span>
            <strong>محصولات پرفروش امروز</strong>
          </div>
        </div>
        <ProductRail products={bestSellers} />
      </section>

      <div className="toolbar-card">
        <select value={filters.categoryId ?? ''} onChange={(event) => setFilters({ categoryId: event.target.value })}>
          <option value="">همه دسته‌بندی‌ها</option>
          {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
        </select>
        <select value={filters.sort ?? 'newest'} onChange={(event) => setFilters({ sort: event.target.value })}>
          <option value="newest">جدیدترین</option>
          <option value="best-selling">پرفروش‌ترین</option>
          <option value="price-asc">ارزان‌ترین</option>
          <option value="price-desc">گران‌ترین</option>
          <option value="rating">بالاترین امتیاز</option>
        </select>
      </div>
      {productsQuery.isLoading ? <div className="loading-box">در حال دریافت محصولات...</div> : <ProductGrid title="همه محصولات" products={products} />}
    </section>
  );
}
