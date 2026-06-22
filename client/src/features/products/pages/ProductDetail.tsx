import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ReceiptText, ShieldCheck, Truck } from 'lucide-react';
import { api } from '../../../services/api';
import { useShopStore } from '../../../store/shopStore';
import { asset, productImage } from '../../../shared/lib/assets';
import { money } from '../../../shared/lib/format';
import { ProductGrid } from '../components/ProductGrid';

export function ProductDetail() {
  const { selectedSlug, addToCart } = useShopStore();
  const productQuery = useQuery({
    queryKey: ['product', selectedSlug],
    queryFn: () => api.getProduct(selectedSlug!),
    enabled: Boolean(selectedSlug),
  });
  const product = productQuery.data;

  if (!product) return <section className="page loading-box">در حال دریافت جزئیات محصول...</section>;

  return (
    <section className="page">
      <div className="breadcrumb">ShopSuite <ChevronLeft size={14} /> {product.categoryName} <ChevronLeft size={14} /> {product.name}</div>
      <div className="product-detail-card">
        <div className="gallery-panel">
          <img src={productImage(product)} alt={product.name} />
          <div className="thumb-row">
            {[1, 2, 3, 4].map((item) => <img key={item} src={asset(`img/single-product/thumbnail-${item}.jpg`)} alt="" />)}
          </div>
        </div>
        <div className="detail-info">
          <small>{product.brand} / {product.categoryName}</small>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="metrics">
            <span>امتیاز {product.rating}</span>
            <span>موجودی {product.stockQuantity}</span>
            <span>{product.soldCount} فروش</span>
          </div>
          <div className="service-row">
            <span><ShieldCheck size={18} /> ضمانت اصالت کالا</span>
            <span><Truck size={18} /> ارسال سریع</span>
            <span><ReceiptText size={18} /> فاکتور رسمی</span>
          </div>
          {product.specifications.length > 0 && (
            <div className="spec-table">
              <h2>مشخصات محصول</h2>
              {product.specifications.map((spec) => (
                <div className="spec-row" key={spec.id}>
                  <span>{spec.key}</span>
                  <strong>{spec.value}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        <aside className="buy-box">
          <strong>{money(product.price)}</strong>
          {product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}
          <p>ارسال از انبار ShopSuite</p>
          <button className="danger" onClick={() => addToCart(product)}>افزودن به سبد خرید</button>
        </aside>
      </div>
      <ProductGrid title="محصولات مشابه" products={product.similarProducts} />
    </section>
  );
}
