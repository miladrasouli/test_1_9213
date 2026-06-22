import type { ProductSummaryDto } from '../../../services/api';
import { ProductCard } from './ProductCard';

export function ProductRail({ products }: { products: ProductSummaryDto[] }) {
  return (
    <div className="product-rail">
      {products.map((product, index) => <ProductCard product={product} index={index} key={product.id} compact />)}
    </div>
  );
}
