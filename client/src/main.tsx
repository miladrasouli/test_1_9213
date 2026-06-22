import { type FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  FileText,
  Heart,
  HelpCircle,
  Home,
  LayoutGrid,
  MapPin,
  Menu,
  Newspaper,
  PackagePlus,
  Phone,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  api,
  sampleUserId,
  type ArticleDto,
  type CategoryDto,
  type DashboardDto,
  type OrderDto,
  type ProductDetailDto,
  type ProductSummaryDto,
  type UpsertProductPayload,
  type UserProfileDto,
} from './api';
import { useShopStore, type CartItem, type ViewKey } from './store';
import './styles.css';

type IconComponent = LucideIcon;
type NavItem = [ViewKey, string, IconComponent];
type AddressFormValues = Omit<UserProfileDto['addresses'][number], 'id'>;
type ProfileFormValues = Pick<UserProfileDto, 'fullName' | 'email' | 'phoneNumber'>;
type ProductFormValues = {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  brand: string;
  price: string;
  compareAtPrice?: string;
  stockQuantity: string;
  isFeatured?: boolean;
  imageUrls: string;
  specifications: string;
};

const asset = (path: string) => `/didikala/${path}`;
const money = (value: number | null | undefined) => `${new Intl.NumberFormat('fa-IR').format(value ?? 0)} تومان`;
const fallbackProducts = [
  asset('img/products/01.jpg'),
  asset('img/products/02.jpg'),
  asset('img/products/03.jpg'),
  asset('img/products/04.jpg'),
  asset('img/products/05.jpg'),
  asset('img/products/06.jpg'),
  asset('img/products/07.jpg'),
  asset('img/products/08.jpg'),
];

function productImage(product: ProductSummaryDto | ProductDetailDto | CartItem, index = 0) {
  if ('primaryImageUrl' in product && product.primaryImageUrl?.startsWith('http')) return product.primaryImageUrl;
  if ('imageUrls' in product && product.imageUrls[0]?.startsWith('http')) return product.imageUrls[0];
  return fallbackProducts[index % fallbackProducts.length];
}

function parseSpecifications(value: string) {
  return value
    .split('\n')
    .map((line, index) => {
      const [key, ...rest] = line.split(':');
      return { key: key.trim(), value: rest.join(':').trim(), sortOrder: index + 1 };
    })
    .filter((item) => item.key && item.value);
}

function App() {
  const { activeView, setActiveView, cart } = useShopStore();
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

function TopHeader({
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

function HomeView({ categories }: { categories: CategoryDto[] }) {
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

function Hero() {
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

function CategoryStrip({ categories }: { categories: CategoryDto[] }) {
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

function ProductRail({ products }: { products: ProductSummaryDto[] }) {
  return (
    <div className="product-rail">
      {products.map((product, index) => <ProductCard product={product} index={index} key={product.id} compact />)}
    </div>
  );
}

function ProductGrid({ title, products }: { title: string; products: ProductSummaryDto[] }) {
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

function ProductCard({ product, index = 0, compact = false }: { product: ProductSummaryDto; index?: number; compact?: boolean }) {
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

function ProductDetail() {
  const { selectedSlug, addToCart } = useShopStore();
  const [product, setProduct] = useState<ProductDetailDto | null>(null);

  useEffect(() => {
    if (selectedSlug) api.getProduct(selectedSlug).then(setProduct);
  }, [selectedSlug]);

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

function CartView() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useShopStore();
  const [message, setMessage] = useState('');
  const submitOrder = async () => {
    const order = await api.createOrder({
      userId: sampleUserId,
      addressId: null,
      notes: 'ثبت از فرانت React TypeScript بر اساس قالب didikala',
      items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
    });
    clearCart();
    setMessage(`سفارش ${order.orderNumber} ثبت شد. شماره فاکتور: ${order.invoice?.invoiceNumber}`);
  };

  return (
    <section className="page cart-layout">
      <div className="section-card">
        <div className="section-heading">
          <h2>سبد خرید</h2>
          <span>{cart.length} کالا</span>
        </div>
        <div className="cart-list">
          {cart.map((item, index) => (
            <div className="cart-item" key={item.id}>
              <img src={productImage(item, index)} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>{item.shortDescription}</p>
                <span>قیمت واحد: {money(item.price)}</span>
              </div>
              <input type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value))} />
              <strong>{money(item.price * item.quantity)}</strong>
              <button onClick={() => removeFromCart(item.id)}>حذف</button>
            </div>
          ))}
          {cart.length === 0 && <div className="empty-cart">سبد خرید شما خالی است.</div>}
        </div>
      </div>
      <aside className="summary-box">
        <span>مبلغ قابل پرداخت</span>
        <strong>{money(cartTotal())}</strong>
        <button className="danger" disabled={cart.length === 0} onClick={submitOrder}>ثبت سفارش و صدور فاکتور</button>
        {message && <p className="success">{message}</p>}
      </aside>
    </section>
  );
}

function ProfileView() {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const { register, handleSubmit, reset } = useForm<ProfileFormValues>();
  const addressForm = useForm<AddressFormValues>();

  useEffect(() => {
    api.getProfile(sampleUserId).then((data) => {
      setProfile(data);
      reset(data);
    });
  }, [reset]);

  const saveProfile = (values: ProfileFormValues) => api.updateProfile(sampleUserId, values).then(() => api.getProfile(sampleUserId).then(setProfile));
  const saveAddress = (values: AddressFormValues) => api.addAddress(sampleUserId, { ...values, isDefault: Boolean(values.isDefault) }).then(() => api.getProfile(sampleUserId).then(setProfile));

  return (
    <section className="page profile-layout">
      <aside className="profile-menu">
        <img src={asset('img/theme/avatar.png')} alt="" />
        <strong>{profile?.fullName ?? 'کاربر فروشگاه'}</strong>
        <span>{profile?.phoneNumber}</span>
        <button>اطلاعات حساب</button>
        <button>آدرس‌ها</button>
        <button>سفارش‌ها</button>
      </aside>
      <div className="profile-content">
        <form className="section-card form-grid" onSubmit={handleSubmit(saveProfile)}>
          <h2>اطلاعات شخصی</h2>
          <input placeholder="نام کامل" {...register('fullName')} />
          <input placeholder="ایمیل" {...register('email')} />
          <input placeholder="شماره تماس" {...register('phoneNumber')} />
          <button className="primary">ذخیره پروفایل</button>
        </form>
        <form className="section-card form-grid" onSubmit={addressForm.handleSubmit(saveAddress)}>
          <h2>ثبت آدرس جدید</h2>
          {[
            ['title', 'عنوان آدرس'],
            ['province', 'استان'],
            ['city', 'شهر'],
            ['street', 'نشانی کامل'],
            ['postalCode', 'کد پستی'],
            ['receiverName', 'نام گیرنده'],
            ['receiverPhone', 'شماره گیرنده'],
          ].map(([field, label]) => <input key={field} placeholder={label} {...addressForm.register(field as keyof AddressFormValues)} />)}
          <label className="check"><input type="checkbox" {...addressForm.register('isDefault')} /> آدرس پیش‌فرض</label>
          <button className="primary">افزودن آدرس</button>
        </form>
        <div className="section-card">
          <h2>آدرس‌های ثبت‌شده</h2>
          <div className="address-list">
            {profile?.addresses.map((address) => (
              <div key={address.id}>
                <MapPin size={18} />
                <span>{address.title}: {address.province}، {address.city}، {address.street}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OrdersView() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  useEffect(() => { api.getOrders(sampleUserId).then(setOrders); }, []);
  return (
    <section className="page">
      <div className="section-card">
        <div className="section-heading">
          <h2>سوابق خرید</h2>
          <span>{orders.length} سفارش</span>
        </div>
        <OrderList orders={orders} />
      </div>
    </section>
  );
}

return (
  <section className="page admin-page">
    <div className="dashboard-grid">
      <Stat icon={Boxes} label="تعداد محصولات" value={dashboard?.totalProducts ?? 0} />
      <Stat icon={ShoppingBag} label="تعداد سفارش‌ها" value={dashboard?.totalOrders ?? 0} />
      <Stat icon={ReceiptText} label="درآمد کل" value={money(dashboard?.totalRevenue ?? 0)} />
      <Stat icon={PackagePlus} label="کالاهای کم‌موجودی" value={dashboard?.lowStockProducts ?? 0} />
    </div>

    <div className="section-card">
      <div className="section-heading">
        <div>
          <h2>ثبت محصول</h2>
          <span>همراه با مشخصات محصول</span>
        </div>
      </div>

      {adminMessage && <div className="admin-message">{adminMessage}</div>}

      <form className="admin-product-form" onSubmit={handleSubmit(createProduct)}>
        <div className="admin-form-grid">
          <div className="admin-form-field">
            <label>دسته‌بندی محصول *</label>
            <select {...register('categoryId')}>
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="admin-form-hint">محصول باید حتماً داخل یک دسته‌بندی ثبت شود.</span>
          </div>

          <div className="admin-form-field">
            <label>نام محصول *</label>
            <input {...register('name')} placeholder="مثلاً گوشی سامسونگ A55" />
            <span className="admin-form-hint">نامی که به کاربر نمایش داده می‌شود.</span>
          </div>

          <div className="admin-form-field">
            <label>اسلاگ *</label>
            <input {...register('slug')} placeholder="مثلاً samsung-a55" />
            <span className="admin-form-hint">باید یکتا باشد. تکراری باشد خطا می‌دهد.</span>
          </div>

          <div className="admin-form-field">
            <label>برند</label>
            <input {...register('brand')} placeholder="مثلاً Samsung" />
            <span className="admin-form-hint">اگر خالی باشد ShopSuite ثبت می‌شود.</span>
          </div>

          <div className="admin-form-field">
            <label>قیمت *</label>
            <input {...register('price')} type="number" min="0" placeholder="مثلاً 25000000" />
            <span className="admin-form-hint">قیمت باید عددی و بزرگ‌تر از صفر باشد.</span>
          </div>

          <div className="admin-form-field">
            <label>قیمت قبل</label>
            <input {...register('compareAtPrice')} type="number" min="0" placeholder="مثلاً 30000000" />
            <span className="admin-form-hint">برای نمایش تخفیف استفاده می‌شود.</span>
          </div>

          <div className="admin-form-field">
            <label>موجودی *</label>
            <input {...register('stockQuantity')} type="number" min="0" placeholder="مثلاً 10" />
            <span className="admin-form-hint">موجودی نمی‌تواند منفی باشد.</span>
          </div>

          <div className="admin-form-field">
            <label>تصاویر محصول</label>
            <textarea
              {...register('imageUrls')}
              rows={4}
              placeholder="هر آدرس عکس را در یک خط وارد کنید"
            />
            <span className="admin-form-hint">هر URL تصویر در یک خط جداگانه قرار بگیرد.</span>
          </div>

          <div className="admin-form-field full">
            <label>توضیح کوتاه</label>
            <input {...register('shortDescription')} placeholder="یک توضیح کوتاه برای کارت محصول" />
            <span className="admin-form-hint">در لیست محصولات نمایش داده می‌شود.</span>
          </div>

          <div className="admin-form-field full">
            <label>توضیح کامل</label>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="توضیحات کامل محصول"
            />
            <span className="admin-form-hint">در صفحه جزئیات محصول نمایش داده می‌شود.</span>
          </div>
        </div>

        <div className="product-spec-panel">
          <div className="product-spec-header">
            <div>
              <h3>مشخصات محصول</h3>
              <p>مثلاً رنگ، وزن، گارانتی، جنس بدنه، حافظه، سایز و...</p>
            </div>

            <button type="button" className="secondary" onClick={addSpecRow}>
              افزودن مشخصه
            </button>
          </div>

          <div className="product-spec-list">
            {specRows.map((row, index) => (
              <div className="product-spec-row" key={index}>
                <input
                  value={row.key}
                  onChange={(event) => updateSpecRow(index, 'key', event.target.value)}
                  placeholder="عنوان مشخصه، مثلا رنگ"
                />

                <input
                  value={row.value}
                  onChange={(event) => updateSpecRow(index, 'value', event.target.value)}
                  placeholder="مقدار، مثلا مشکی"
                />

                <button
                  type="button"
                  className="danger-light"
                  onClick={() => removeSpecRow(index)}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>

        <label className="check">
          <input type="checkbox" {...register('isFeatured')} />
          محصول ویژه
        </label>

        <button className="primary" type="submit">
          ثبت محصول
        </button>
      </form>
    </div>

    <div className="section-card">
      <h2>سوابق فروش</h2>
      <OrderList orders={orders} />
    </div>

    <div className="section-card">
      <div className="section-heading">
        <h2>کالاهای ثبت‌شده</h2>
        <span>{adminProducts.length} کالا</span>
      </div>

      <div className="admin-product-list">
        {adminProducts.map((product, index) => (
          <div key={product.id}>
            <img src={productImage(product, index)} alt={product.name} />
            <strong>{product.name}</strong>
            <span>{product.categoryName}</span>
            <span>{money(product.price)}</span>
            <span>موجودی {product.stockQuantity}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

function Stat({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string | number }) {
  return <div className="stat"><Icon size={22} /><span>{label}</span><strong>{value}</strong></div>;
}

function OrderList({ orders }: { orders: OrderDto[] }) {
  return (
    <div className="order-list">
      {orders.map((order) => (
        <div className="order" key={order.id}>
          <div><strong>{order.orderNumber}</strong><span>{order.customerName}</span></div>
          <div>{money(order.grandTotal)}</div>
          <div>{order.invoice?.invoiceNumber ?? 'بدون فاکتور'}</div>
        </div>
      ))}
      {orders.length === 0 && <div className="empty-cart">سفارشی ثبت نشده است.</div>}
    </div>
  );
}

function ArticlesView() {
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  useEffect(() => { api.getArticles().then(setArticles); }, []);
  return (
    <section className="page">
      <div className="section-card">
        <div className="section-heading">
          <h2>مجله فروشگاه</h2>
          <span>اخبار و راهنمای خرید</span>
        </div>
        <div className="article-grid">
          {articles.map((article, index) => (
            <article className="article-card" key={article.id}>
              <img src={article.coverImageUrl?.startsWith('http') ? article.coverImageUrl : asset(`img/post-thumbnail/${(index % 5) + 1}.png`)} alt={article.title} />
              <div>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutView() {
  const [about, setAbout] = useState<{ title: string; body: string; supportPhone: string; email: string } | null>(null);
  useEffect(() => { api.getAbout().then(setAbout); }, []);
  return (
    <section className="page">
      <div className="about-cover" style={{ backgroundImage: `url(${asset('img/theme/page-cover.jpg')})` }}>
        <h1>{about?.title ?? 'درباره ShopSuite'}</h1>
        <p>{about?.body}</p>
      </div>
      <div className="service-row wide">
        <span><ShieldCheck size={20} /> ضمانت اصالت</span>
        <span><Truck size={20} /> ارسال سریع</span>
        <span><ReceiptText size={20} /> فاکتور رسمی</span>
        <span><UserRound size={20} /> پشتیبانی مشتریان</span>
      </div>
    </section>
  );
}

function ContactView() {
  return (
    <section className="page">
      <div className="public-grid">
        <div className="section-card public-panel">
          <h1>تماس با ما</h1>
          <p>برای پیگیری سفارش، همکاری با فروشگاه یا سوال درباره محصولات از راه‌های زیر با ما در ارتباط باشید.</p>
          <div className="contact-list">
            <span><Phone size={20} /> 021-00000000</span>
            <span><MapPin size={20} /> تهران، خیابان ولیعصر، واحد پشتیبانی ShopSuite</span>
            <span><FileText size={20} /> support@shopsuite.local</span>
          </div>
        </div>
        <div className="section-card public-panel">
          <h2>ساعات پاسخگویی</h2>
          <p>شنبه تا چهارشنبه از ساعت ۹ تا ۱۸ و پنجشنبه‌ها از ساعت ۹ تا ۱۳.</p>
          <button className="primary" onClick={() => useShopStore.getState().setActiveView('faq')}>مشاهده سوالات متداول</button>
        </div>
      </div>
    </section>
  );
}

function FaqView() {
  const items = [
    ['چطور کالا ثبت می‌شود؟', 'از پنل مدیریت وارد بخش ثبت محصول شوید، دسته‌بندی، نام، قیمت، موجودی و تصویر را وارد کنید و دکمه ثبت محصول را بزنید.'],
    ['چطور جزئیات محصول دیده می‌شود؟', 'روی تصویر، نام کالا یا دکمه مشاهده جزئیات در کارت محصول کلیک کنید.'],
    ['آیا داده‌ها واقعی در SQL Server ذخیره می‌شوند؟', 'بله، API اکنون به دیتابیس ShopSuiteDb روی SQL Server لوکال وصل است.'],
    ['ثبت سفارش چه کاری انجام می‌دهد؟', 'سفارش، آیتم‌های سفارش و فاکتور در بک‌اند ثبت می‌شوند و موجودی محصول کاهش پیدا می‌کند.'],
  ];

  return (
    <section className="page">
      <div className="section-card">
        <div className="section-heading">
          <h2>سوالات متداول</h2>
          <span>راهنمای استفاده از فروشگاه</span>
        </div>
        <div className="faq-list">
          {items.map(([question, answer]) => (
            <details key={question} open>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="main-container footer-inner">
        <img src={asset('img/logo.png')} alt="ShopSuite" />
        <span>فروشگاه نمونه ساخته‌شده با ASP.NET Core، React، TypeScript، Flutter و الگوی didikala</span>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
