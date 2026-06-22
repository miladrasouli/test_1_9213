import { useEffect, useState } from 'react';
import type { CategoryDto, ProductSummaryDto } from '../api';
import { api } from '../api';
import { useShopStore } from '../store';
import { asset } from '../utils/shop';
import { ProductGrid, ProductRail } from '../components/ProductSections';

export function HomeView({ categories }: { categories: CategoryDto[] }) {
  const { filters, setFilters } = useShopStore();
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductSummaryDto[]>([]);

  useEffect(() => {
    api.getBestSellers().then(setBestSellers);
  }, []);

  useEffect(() => {
    api.getProducts(filters).then((result) => setProducts(result.items));
  }, [filters]);

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
      <ProductGrid title="همه محصولات" products={products} />
    </section>
  );
}

export function Hero() {
  return (
    <div className="template-hero">
      <img src={asset('img/main-slider/1.jpg')} alt="اسلایدر فروشگاه" />
      <div className="hero-badges">
        <img src={asset('img/banner/small-banner-1.jpg')} alt="تخفیف" />
        <img src={asset('img/banner/small-banner-2.jpg')} alt="فروش ویژه" />
      </div>
    </div>
  );
}

export function CategoryStrip({ categories }: { categories: CategoryDto[] }) {
  const icons = [
    asset('img/category/notebook-computer.png'),
    asset('img/category/hanbok.png'),
    asset('img/category/sofa.png'),
    asset('img/category/school-material.png'),
    asset('img/category/repair-tools.png'),
  ];
  return (
    <section className="category-strip">
      {categories.map((category, index) => (
        <button key={category.id} onClick={() => useShopStore.getState().setFilters({ categoryId: category.id })}>
          <img src={icons[index % icons.length]} alt="" />
          <span>{category.name}</span>
        </button>
      ))}
    </section>
  );
}
