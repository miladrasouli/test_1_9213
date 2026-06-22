import { Heart } from 'lucide-react';
import type { ProductSummaryDto } from '../../../services/api';
import { useShopStore } from '../../../store/shopStore';
import { productImage } from '../../../shared/lib/assets';
import { money } from '../../../shared/lib/format';

export function ProductCard({ product, index = 0, compact = false }: { product: ProductSummaryDto; index?: number; compact?: boolean }) {
  const { addToCart, openProduct } = useShopStore();
  return (
    <article className={compact ? 'product-card compact' : 'product-card'}>
      <button className="product-image" onClick={() => openProduct(product.slug)}>
        <img src={productImage(product, index)} alt={product.name} />
      </button>
      <div className="product-meta">
        <button className="favorite" aria-label="افزودن به علاقه‌مندی"><Heart size={16} /></button>
        <small>{product.categoryName} / {product.brand}</small>
        <h3 onClick={() => openProduct(product.slug)}>{product.name}</h3>
        <p>{product.shortDescription}</p>
        <div className="rating-row">
          <span>★ {product.rating}</span>
          <span>{product.soldCount} فروش</span>
        </div>
        <div className="price-row">
          <strong>{money(product.price)}</strong>
          {product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}
        </div>
        <button className="secondary detail-button" onClick={() => openProduct(product.slug)}>مشاهده جزئیات</button>
        <button className="primary add-button" onClick={() => addToCart(product)}>افزودن به سبد</button>
      </div>
    </article>
  );
}
