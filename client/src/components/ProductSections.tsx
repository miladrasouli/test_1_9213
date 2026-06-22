import { useEffect, useState } from 'react';
import { ChevronLeft, Heart, ReceiptText, ShieldCheck, Truck } from 'lucide-react';
import { api, type ProductDetailDto, type ProductSummaryDto } from '../api';
import { useShopStore } from '../store';
import { money, productImage } from '../utils/shop';

export function ProductRail({ products }: { products: ProductSummaryDto[] }) {
  return (
    <div className="product-rail">
      {products.map((product, index) => <ProductCard product={product} index={index} key={product.id} compact />)}
    </div>
  );
}

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

export function ProductDetail() {
  const { selectedSlug, addToCart } = useShopStore();
  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (selectedSlug) {
      api.getProduct(selectedSlug).then((data) => {
        setProduct(data);
        setSelectedImage(data.imageUrls[0] || productImage(data));
      });
    }
  }, [selectedSlug]);

  if (!product) return <section className="page loading-box">در حال دریافت جزئیات محصول...</section>;

  return (
    <section className="page">
      <div className="breadcrumb">ShopSuite <ChevronLeft size={14} /> {product.categoryName} <ChevronLeft size={14} /> {product.name}</div>
      <div className="product-detail-card">
        <div className="gallery-panel">
          <img src={selectedImage || productImage(product)} alt={product.name} />
          <div className="thumb-row">
            {(product.imageUrls.length > 0 ? product.imageUrls : [productImage(product)]).map((url) => (
              <button className={selectedImage === url ? 'active-thumb' : ''} key={url} onClick={() => setSelectedImage(url)} type="button">
                <img src={url} alt={product.name} />
              </button>
            ))}
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
