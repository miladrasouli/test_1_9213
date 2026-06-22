import type { ProductSummaryDto } from '../../../services/api';
import { ProductCard } from './ProductCard';

export function ProductGrid({ title, products }: { title: string; products: ProductSummaryDto[] }) {
  return (
    <section className="section-card">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>نمایش {products.length} کالا</span>
      </div>
      <div className="product-grid">
        {products.map((product, index) => <ProductCard product={product} index={index} key={product.id} />)}
      </div>
    </section>
  );
}
