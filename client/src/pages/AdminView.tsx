import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, Edit3, LayoutDashboard, Link2, ListTree, MapPin, PackagePlus, ReceiptText, Save, Settings, Trash2, TrendingUp, UserRound, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api, type AdminUserDetailDto, type CategoryDto, type DashboardDto, type FooterSectionDto, type OrderDto, type ProductDetailDto, type ProductSummaryDto, type SiteMenuItemDto, type SiteSettingsDto, type UpdateAdminUserPayload, type UploadedProductImageDto, type UpsertProductPayload, type UserProfileDto } from '../api';
import { useShopStore } from '../store';
import { defaultSpecs, money, productImage, type ProductSpecInput } from '../utils/shop';
import { OrderList } from '../components/OrderList';

type AdminTab = 'dashboard' | 'products' | 'bestSellers' | 'settings' | 'footer' | 'menus' | 'users' | 'orders';

type ProductFormState = {
  id?: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  brand: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  isFeatured: boolean;
};

const emptyProduct: ProductFormState = {
  categoryId: '',
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  brand: '',
  price: '',
  compareAtPrice: '',
  stockQuantity: '0',
  isFeatured: false,
};

const defaultSiteSettings: SiteSettingsDto = {
  topBannerImageUrl: '/didikala/img/banner/large-ads.jpg',
  topBannerLink: '',
  topBannerAlt: 'بنر بالای فروشگاه',
  bestSellerTake: 8,
};

const viewOptions = ['home', 'cart', 'profile', 'orders', 'articles', 'catalogs', 'brands', 'about', 'contact', 'faq', 'admin', 'product'];

export function AdminView() {
  const { currentUser, setActiveView } = useShopStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [footerSections, setFooterSections] = useState<FooterSectionDto[]>([]);
  const [menus, setMenus] = useState<SiteMenuItemDto[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsDto>(defaultSiteSettings);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProduct);
  const [specRows, setSpecRows] = useState<ProductSpecInput[]>(defaultSpecs);
  const [uploadedImages, setUploadedImages] = useState<UploadedProductImageDto[]>([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');
  const [message, setMessage] = useState('');

  const isReady = currentUser?.isAdmin;

  const reloadAdminData = () => {
    if (!currentUser?.isAdmin) return;
    api.getDashboard(currentUser.id).then(setDashboard);
    api.getAdminOrders(currentUser.id).then(setOrders);
    api.getAdminUsers(currentUser.id).then(setUsers);
    api.getCategories().then((items) => {
      setCategories(items);
      setProductForm((current) => ({ ...current, categoryId: current.categoryId || items[0]?.id || '' }));
    });
    api.getProducts({ pageSize: 48, sort: 'newest' }).then((result) => setProducts(result.items));
    api.getAdminFooterSections(currentUser.id).then(setFooterSections);
    api.getAdminMenus(currentUser.id).then(setMenus);
    api.getAdminSiteSettings(currentUser.id).then(setSiteSettings);
  };

  useEffect(() => {
    reloadAdminData();
  }, [currentUser]);

  const imageUrls = useMemo(
    () => [primaryImageUrl, ...uploadedImages.map((image) => image.url).filter((url) => url !== primaryImageUrl)].filter(Boolean),
    [primaryImageUrl, uploadedImages],
  );

  if (!currentUser) {
    return (
      <section className="page">
        <div className="section-card public-panel">
          <h2>برای ورود به پنل مدیریت ابتدا لاگین کنید</h2>
          <button className="primary" type="button" onClick={() => setActiveView('profile')}>ورود کاربر</button>
        </div>
      </section>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <section className="page">
        <div className="section-card public-panel">
          <h2>دسترسی مدیریتی ندارید</h2>
          <p>فقط کاربر با نقش Admin می‌تواند داده‌های مدیریتی را ثبت، ویرایش و حذف کند.</p>
          <button className="primary" type="button" onClick={() => setActiveView('profile')}>تغییر کاربر</button>
        </div>
      </section>
    );
  }

  const updateProductField = (field: keyof ProductFormState, value: string | boolean) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const resetProductForm = () => {
    setProductForm({ ...emptyProduct, categoryId: categories[0]?.id || '' });
    setSpecRows(defaultSpecs);
    setUploadedImages([]);
    setPrimaryImageUrl('');
  };

  const uploadImages = (files: FileList | null) => {
    if (!files?.length || !isReady) return;
    setMessage('در حال آپلود تصاویر...');
    api.uploadProductImages(Array.from(files), currentUser.id)
      .then((images) => {
        const next = [...uploadedImages, ...images];
        setUploadedImages(next);
        setPrimaryImageUrl((current) => current || next[0]?.url || '');
        setMessage(`${images.length} تصویر آپلود شد.`);
      })
      .catch((error: Error) => setMessage(error.message));
  };

  const saveProduct = () => {
    if (!primaryImageUrl) {
      setMessage('حداقل یک تصویر آپلود و عکس اصلی را انتخاب کنید.');
      return;
    }

    const payload: UpsertProductPayload = {
      categoryId: productForm.categoryId,
      name: productForm.name,
      slug: productForm.slug,
      shortDescription: productForm.shortDescription,
      description: productForm.description,
      brand: productForm.brand,
      price: Number(productForm.price),
      compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : null,
      stockQuantity: Number(productForm.stockQuantity),
      isFeatured: productForm.isFeatured,
      imageUrls,
      specifications: specRows
        .map((spec, index) => ({ key: spec.key.trim(), value: spec.value.trim(), sortOrder: index + 1 }))
        .filter((spec) => spec.key && spec.value),
    };

    const action = productForm.id
      ? api.updateProduct(productForm.id, payload, currentUser.id)
      : api.createProduct(payload, currentUser.id);

    Promise.resolve(action).then(() => {
      setMessage(productForm.id ? 'محصول ویرایش شد.' : 'محصول ثبت شد.');
      resetProductForm();
      reloadAdminData();
    }).catch((error: Error) => setMessage(error.message));
  };

  const editProduct = (product: ProductSummaryDto) => {
    api.getProduct(product.slug).then((detail: ProductDetailDto) => {
      setProductForm({
        id: detail.id,
        categoryId: detail.categoryId,
        name: detail.name,
        slug: detail.slug,
        shortDescription: detail.shortDescription,
        description: detail.description,
        brand: detail.brand,
        price: String(detail.price),
        compareAtPrice: detail.compareAtPrice ? String(detail.compareAtPrice) : '',
        stockQuantity: String(detail.stockQuantity),
        isFeatured: detail.isFeatured,
      });
      setSpecRows(detail.specifications.length ? detail.specifications.map((spec) => ({ key: spec.key, value: spec.value })) : defaultSpecs);
      setUploadedImages(detail.imageUrls.map((url) => ({ url, fileName: url.split('/').pop() || 'image' })));
      setPrimaryImageUrl(detail.imageUrls[0] || '');
      setActiveTab('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const deleteProduct = (id: string) => {
    api.deleteProduct(id, currentUser.id).then(() => {
      setMessage('محصول حذف شد.');
      reloadAdminData();
    });
  };

  const saveSiteSettings = () => {
    api.updateSiteSettings({
      ...siteSettings,
      bestSellerTake: Number(siteSettings.bestSellerTake) || 8,
    }, currentUser.id).then(() => {
      setMessage('تنظیمات ویترین ذخیره شد.');
      reloadAdminData();
    }).catch((error: Error) => setMessage(error.message));
  };

  const navItems: Array<[AdminTab, string, typeof LayoutDashboard]> = [
    ['dashboard', 'داشبورد', LayoutDashboard],
    ['products', 'محصولات', PackagePlus],
    ['bestSellers', 'پرفروش‌ها', TrendingUp],
    ['settings', 'تنظیمات ویترین', Settings],
    ['footer', 'فوتر سایت', Link2],
    ['menus', 'منوها', ListTree],
    ['users', 'کاربران', UsersRound],
    ['orders', 'سفارش‌ها', ReceiptText],
  ];

  return (
    <section className="page admin-metronic">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>ShopSuite Admin</strong>
          <span>پنل مدیریت</span>
        </div>
        {navItems.map(([key, label, Icon]) => (
          <button key={key} type="button" className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <div>
            <span>مدیر سایت</span>
            <strong>{currentUser.fullName}</strong>
          </div>
          {message && <p className="success">{message}</p>}
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="stats">
              <Stat icon={Boxes} label="محصولات" value={dashboard?.productCount ?? 0} />
              <Stat icon={ReceiptText} label="سفارش‌ها" value={dashboard?.orderCount ?? 0} />
              <Stat icon={BarChart3} label="فروش کل" value={money(dashboard?.totalSales ?? 0)} />
            </div>
            <div className="section-card">
              <h2>آخرین سفارش‌ها</h2>
              <OrderList orders={dashboard?.recentOrders ?? []} />
            </div>
            <div className="section-card admin-best-seller-panel">
              <div className="section-heading">
                <h2>محصولات پرفروش</h2>
                <span>{dashboard?.bestSellers.length ?? 0} کالا</span>
              </div>
              <BestSellerList products={dashboard?.bestSellers ?? []} onEdit={editProduct} />
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <>
            <div className="section-card form-grid">
              <h2>{productForm.id ? 'ویرایش محصول' : 'ثبت محصول جدید'}</h2>
              <select value={productForm.categoryId} onChange={(event) => updateProductField('categoryId', event.target.value)}>
                {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
              </select>
              {([
                ['name', 'نام محصول'],
                ['slug', 'اسلاگ'],
                ['shortDescription', 'توضیح کوتاه'],
                ['description', 'توضیح کامل'],
                ['brand', 'برند'],
                ['price', 'قیمت'],
                ['compareAtPrice', 'قیمت قبل'],
                ['stockQuantity', 'موجودی'],
              ] as Array<[keyof ProductFormState, string]>).map(([field, label]) => (
                <input key={field} placeholder={label} value={String(productForm[field] ?? '')} onChange={(event) => updateProductField(field, event.target.value)} />
              ))}
              <label className="check"><input type="checkbox" checked={productForm.isFeatured} onChange={(event) => updateProductField('isFeatured', event.target.checked)} /> محصول ویژه</label>
              <div className="form-field full image-uploader">
                <span>تصاویر محصول</span>
                <input type="file" accept="image/*" multiple onChange={(event) => uploadImages(event.target.files)} />
                <div className="uploaded-image-grid">
                  {uploadedImages.map((image) => (
                    <label className={primaryImageUrl === image.url ? 'uploaded-image primary-image' : 'uploaded-image'} key={image.url}>
                      <img src={image.url} alt={image.fileName} />
                      <span>{image.fileName}</span>
                      <input type="radio" name="primaryImage" checked={primaryImageUrl === image.url} onChange={() => setPrimaryImageUrl(image.url)} />
                      <strong>{primaryImageUrl === image.url ? 'عکس اصلی' : 'گالری'}</strong>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-field full product-spec-editor">
                <div className="spec-editor-heading">
                  <span>ProductSpecifications</span>
                  <button type="button" className="secondary" onClick={() => setSpecRows([...specRows, { key: '', value: '' }])}>افزودن مشخصه</button>
                </div>
                <div className="spec-editor-grid">
                  <strong>Key</strong><strong>Value</strong><span />
                  {specRows.map((spec, index) => (
                    <div className="spec-editor-row" key={index}>
                      <input placeholder="مثل رنگ" value={spec.key} onChange={(event) => setSpecRows(specRows.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item))} />
                      <input placeholder="مثل مشکی" value={spec.value} onChange={(event) => setSpecRows(specRows.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} />
                      <button type="button" className="secondary square-button" onClick={() => setSpecRows(specRows.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={17} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" className="primary" onClick={saveProduct}><Save size={17} /> ذخیره محصول</button>
              {productForm.id && <button type="button" className="secondary" onClick={resetProductForm}>انصراف از ویرایش</button>}
            </div>

            <div className="section-card">
              <div className="section-heading"><h2>محصولات ثبت‌شده</h2><span>{products.length} کالا</span></div>
              <div className="admin-product-list">
                {products.map((product, index) => (
                  <div key={product.id}>
                    <img src={productImage(product, index)} alt={product.name} />
                    <strong>{product.name}</strong>
                    <span>{money(product.price)}</span>
                    <button type="button" className="secondary" onClick={() => editProduct(product)}><Edit3 size={16} /> ویرایش</button>
                    <button type="button" className="secondary" onClick={() => deleteProduct(product.id)}><Trash2 size={16} /> حذف</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'bestSellers' && (
          <div className="section-card admin-best-seller-panel">
            <div className="section-heading">
              <h2>مدیریت محصولات پرفروش</h2>
              <span>بر اساس تعداد فروش محصول</span>
            </div>
            <BestSellerList products={dashboard?.bestSellers ?? []} onEdit={editProduct} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="admin-two-column">
            <div className="section-card form-grid">
              <div className="section-heading full">
                <h2>تنظیمات ویترین عمومی</h2>
                <span>بنر بالا و تعداد پرفروش‌ها</span>
              </div>
              <input
                className="full"
                placeholder="آدرس عکس بنر بالا"
                value={siteSettings.topBannerImageUrl}
                onChange={(event) => setSiteSettings({ ...siteSettings, topBannerImageUrl: event.target.value })}
              />
              <input
                className="full"
                placeholder="لینک بنر، اختیاری"
                value={siteSettings.topBannerLink}
                onChange={(event) => setSiteSettings({ ...siteSettings, topBannerLink: event.target.value })}
              />
              <input
                placeholder="متن جایگزین بنر"
                value={siteSettings.topBannerAlt}
                onChange={(event) => setSiteSettings({ ...siteSettings, topBannerAlt: event.target.value })}
              />
              <input
                placeholder="تعداد محصولات پرفروش"
                type="number"
                min={1}
                max={24}
                value={siteSettings.bestSellerTake}
                onChange={(event) => setSiteSettings({ ...siteSettings, bestSellerTake: Number(event.target.value) })}
              />
              <button type="button" className="primary" onClick={saveSiteSettings}><Save size={17} /> ذخیره تنظیمات</button>
            </div>
            <div className="section-card admin-banner-preview">
              <div className="section-heading">
                <h2>پیش‌نمایش بنر بالا</h2>
                <span>در بخش عمومی سایت</span>
              </div>
              <div style={{ backgroundImage: `url(${siteSettings.topBannerImageUrl || defaultSiteSettings.topBannerImageUrl})` }} />
              <p className="muted-text">{siteSettings.topBannerAlt || 'بنر بالای فروشگاه'}</p>
            </div>
          </div>
        )}

        {activeTab === 'footer' && <FooterCrud sections={footerSections} userId={currentUser.id} reload={reloadAdminData} />}
        {activeTab === 'menus' && <MenuCrud menus={menus} userId={currentUser.id} reload={reloadAdminData} />}
        {activeTab === 'users' && <UsersPanel users={users} orders={orders} adminUserId={currentUser.id} reload={reloadAdminData} />}
        {activeTab === 'orders' && <div className="section-card"><h2>همه سفارش‌ها</h2><OrderList orders={orders} /></div>}
      </div>
    </section>
  );
}

function FooterCrud({ sections, userId, reload }: { sections: FooterSectionDto[]; userId: string; reload: () => void }) {
  const [section, setSection] = useState({ id: '', title: '', sortOrder: '1', isActive: true });
  const [link, setLink] = useState({ id: '', footerSectionId: '', label: '', viewKey: 'home', sortOrder: '1', isActive: true });

  const saveSection = () => {
    const payload = { title: section.title, sortOrder: Number(section.sortOrder), isActive: section.isActive };
    const action = section.id ? api.updateFooterSection(section.id, payload, userId) : api.createFooterSection(payload, userId);
    Promise.resolve(action).then(() => { setSection({ id: '', title: '', sortOrder: '1', isActive: true }); reload(); });
  };

  const saveLink = () => {
    const footerSectionId = link.footerSectionId || sections[0]?.id || '';
    if (!footerSectionId) return;
    const payload = { footerSectionId, label: link.label, viewKey: link.viewKey, sortOrder: Number(link.sortOrder), isActive: link.isActive };
    const action = link.id ? api.updateFooterLink(link.id, payload, userId) : api.createFooterLink(payload, userId);
    Promise.resolve(action).then(() => { setLink({ id: '', footerSectionId: '', label: '', viewKey: 'home', sortOrder: '1', isActive: true }); reload(); });
  };

  return (
    <div className="admin-two-column">
      <div className="section-card form-grid">
        <h2>CRUD ستون‌های فوتر</h2>
        <input placeholder="عنوان ستون" value={section.title} onChange={(event) => setSection({ ...section, title: event.target.value })} />
        <input placeholder="ترتیب" value={section.sortOrder} onChange={(event) => setSection({ ...section, sortOrder: event.target.value })} />
        <label className="check"><input type="checkbox" checked={section.isActive} onChange={(event) => setSection({ ...section, isActive: event.target.checked })} /> فعال</label>
        <button type="button" className="primary" onClick={saveSection}>ذخیره ستون</button>

        <h2>CRUD لینک‌های فوتر</h2>
        <select value={link.footerSectionId || sections[0]?.id || ''} onChange={(event) => setLink({ ...link, footerSectionId: event.target.value })}>
          {sections.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <input placeholder="عنوان لینک" value={link.label} onChange={(event) => setLink({ ...link, label: event.target.value })} />
        <select value={link.viewKey} onChange={(event) => setLink({ ...link, viewKey: event.target.value })}>{viewOptions.map((view) => <option key={view}>{view}</option>)}</select>
        <input placeholder="ترتیب" value={link.sortOrder} onChange={(event) => setLink({ ...link, sortOrder: event.target.value })} />
        <label className="check"><input type="checkbox" checked={link.isActive} onChange={(event) => setLink({ ...link, isActive: event.target.checked })} /> فعال</label>
        <button type="button" className="primary" onClick={saveLink}>ذخیره لینک</button>
      </div>

      <div className="section-card admin-list">
        <h2>فوتر فعلی</h2>
        {sections.map((item) => (
          <div className="admin-crud-row" key={item.id}>
            <strong>{item.title}</strong>
            <span>ترتیب {item.sortOrder}</span>
            <button type="button" className="secondary" onClick={() => setSection({ id: item.id, title: item.title, sortOrder: String(item.sortOrder), isActive: item.isActive })}>ویرایش</button>
            <button type="button" className="secondary" onClick={() => api.deleteFooterSection(item.id, userId).then(reload)}>حذف</button>
            {item.links.map((child) => (
              <div className="admin-crud-row nested" key={child.id}>
                <span>{child.label} → {child.viewKey}</span>
                <button type="button" className="secondary" onClick={() => setLink({ id: child.id, footerSectionId: child.footerSectionId, label: child.label, viewKey: child.viewKey, sortOrder: String(child.sortOrder), isActive: child.isActive })}>ویرایش</button>
                <button type="button" className="secondary" onClick={() => api.deleteFooterLink(child.id, userId).then(reload)}>حذف</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuCrud({ menus, userId, reload }: { menus: SiteMenuItemDto[]; userId: string; reload: () => void }) {
  const [item, setItem] = useState({ id: '', location: 'Header', label: '', viewKey: 'home', icon: 'Home', sortOrder: '1', isActive: true });
  const save = () => {
    const payload = { location: item.location, label: item.label, viewKey: item.viewKey, icon: item.icon, sortOrder: Number(item.sortOrder), isActive: item.isActive };
    const action = item.id ? api.updateMenuItem(item.id, payload, userId) : api.createMenuItem(payload, userId);
    Promise.resolve(action).then(() => { setItem({ id: '', location: 'Header', label: '', viewKey: 'home', icon: 'Home', sortOrder: '1', isActive: true }); reload(); });
  };
  return (
    <div className="admin-two-column">
      <div className="section-card form-grid">
        <h2>CRUD منوها</h2>
        <input placeholder="محل نمایش مثل Header یا Footer" value={item.location} onChange={(event) => setItem({ ...item, location: event.target.value })} />
        <input placeholder="عنوان منو" value={item.label} onChange={(event) => setItem({ ...item, label: event.target.value })} />
        <select value={item.viewKey} onChange={(event) => setItem({ ...item, viewKey: event.target.value })}>{viewOptions.map((view) => <option key={view}>{view}</option>)}</select>
        <input placeholder="آیکن" value={item.icon} onChange={(event) => setItem({ ...item, icon: event.target.value })} />
        <input placeholder="ترتیب" value={item.sortOrder} onChange={(event) => setItem({ ...item, sortOrder: event.target.value })} />
        <label className="check"><input type="checkbox" checked={item.isActive} onChange={(event) => setItem({ ...item, isActive: event.target.checked })} /> فعال</label>
        <button type="button" className="primary" onClick={save}>ذخیره منو</button>
      </div>
      <div className="section-card admin-list">
        <h2>منوهای سایت</h2>
        {menus.map((menu) => (
          <div className="admin-crud-row" key={menu.id}>
            <strong>{menu.label}</strong>
            <span>{menu.location} → {menu.viewKey}</span>
            <button type="button" className="secondary" onClick={() => setItem({ id: menu.id, location: menu.location, label: menu.label, viewKey: menu.viewKey, icon: menu.icon, sortOrder: String(menu.sortOrder), isActive: menu.isActive })}>ویرایش</button>
            <button type="button" className="secondary" onClick={() => api.deleteMenuItem(menu.id, userId).then(reload)}>حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BestSellerList({ products, onEdit }: { products: ProductSummaryDto[]; onEdit: (product: ProductSummaryDto) => void }) {
  if (!products.length) {
    return <p className="muted-text">هنوز محصول پرفروشی ثبت نشده است.</p>;
  }

  return (
    <div className="admin-best-seller-list">
      {products.map((product, index) => (
        <div className="admin-best-seller-row" key={product.id}>
          <span className="rank">{index + 1}</span>
          <img src={productImage(product, index)} alt={product.name} />
          <div>
            <strong>{product.name}</strong>
            <small>{product.categoryName} / {product.brand}</small>
          </div>
          <span>{product.soldCount} فروش</span>
          <strong>{money(product.price)}</strong>
          <button type="button" className="secondary" onClick={() => onEdit(product)}><Edit3 size={16} /> ویرایش</button>
        </div>
      ))}
    </div>
  );
}

const formatDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '-';

function UsersPanel({ users, orders, adminUserId, reload }: { users: UserProfileDto[]; orders: OrderDto[]; adminUserId: string; reload: () => void }) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '');
  const [detail, setDetail] = useState<AdminUserDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [userForm, setUserForm] = useState<UpdateAdminUserPayload>({
    fullName: '',
    email: '',
    phoneNumber: '',
    isAdmin: false,
    isActive: false,
  });

  useEffect(() => {
    if (!users.length) {
      setSelectedUserId('');
      setDetail(null);
      return;
    }

    setSelectedUserId((current) => current || users[0].id);
  }, [users]);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoading(true);
    api.getAdminUserDetail(selectedUserId, adminUserId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [adminUserId, selectedUserId]);

  const selectedProfile = detail?.profile;
  const selectedOrders = detail?.orders ?? [];

  useEffect(() => {
    if (!selectedProfile) return;
    setUserForm({
      fullName: selectedProfile.fullName,
      email: selectedProfile.email ?? '',
      phoneNumber: selectedProfile.phoneNumber ?? '',
      isAdmin: selectedProfile.isAdmin,
      isActive: selectedProfile.isActive,
    });
  }, [selectedProfile]);

  const saveUser = () => {
    if (!selectedProfile) return;
    setSaving(true);
    setNotice('');
    api.updateAdminUser(selectedProfile.id, userForm, adminUserId)
      .then(() => {
        setNotice('اطلاعات، نقش و وضعیت کاربر ذخیره شد.');
        return api.getAdminUserDetail(selectedProfile.id, adminUserId).then(setDetail);
      })
      .then(reload)
      .catch((error: Error) => setNotice(error.message))
      .finally(() => setSaving(false));
  };

  return (
    <div className="admin-user-workspace">
      <div className="section-card admin-list admin-user-list">
        <div className="admin-panel-title">
          <h2>کاربران و سفارش‌هایشان</h2>
          <span>{users.length} کاربر</span>
        </div>
        <div className="admin-user-list-body">
          {users.map((user) => (
            <button type="button" className={selectedUserId === user.id ? 'admin-user-row active' : 'admin-user-row'} key={user.id} onClick={() => setSelectedUserId(user.id)}>
              <div className="admin-user-avatar">{user.fullName.slice(0, 1)}</div>
              <div className="admin-user-summary">
                <strong>{user.fullName}</strong>
                <span>{user.username}</span>
                <small>{user.email || 'بدون ایمیل'}</small>
              </div>
              <div className="admin-user-badges">
                <span className={user.isActive ? 'user-badge active' : 'user-badge pending'}>{user.isActive ? 'فعال' : 'در انتظار تایید'}</span>
                <span className={user.isAdmin ? 'user-badge admin' : 'user-badge'}>{user.isAdmin ? 'Admin' : 'Customer'}</span>
                <small>{orders.filter((order) => order.userId === user.id).length} سفارش</small>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-user-detail">
        {loading && <div className="section-card">در حال دریافت اطلاعات کاربر...</div>}
        {!loading && !selectedProfile && <div className="section-card">کاربری انتخاب نشده است.</div>}
        {!loading && selectedProfile && detail && (
          <>
            <div className="stats compact-stats">
              <Stat icon={ReceiptText} label="تعداد خرید" value={detail.orderCount} />
              <Stat icon={BarChart3} label="جمع خرید" value={money(detail.totalSpent)} />
              <Stat icon={Boxes} label="پرداخت موفق" value={money(detail.paidTotal)} />
              <Stat icon={MapPin} label="آدرس‌ها" value={selectedProfile.addresses.length} />
            </div>

            <div className="admin-user-grid">
              <div className="section-card user-profile-card admin-user-editor">
                <div className="section-heading">
                  <h2>مدیریت کاربر</h2>
                  <span>{selectedProfile.username}</span>
                </div>
                <div className="form-grid">
                  <input value={userForm.fullName} placeholder="نام کامل" onChange={(event) => setUserForm({ ...userForm, fullName: event.target.value })} />
                  <input value={userForm.email} placeholder="ایمیل" onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} />
                  <input value={userForm.phoneNumber} placeholder="شماره تماس" onChange={(event) => setUserForm({ ...userForm, phoneNumber: event.target.value })} />
                  <select value={userForm.isAdmin ? 'Admin' : 'Customer'} onChange={(event) => setUserForm({ ...userForm, isAdmin: event.target.value === 'Admin' })}>
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <label className="check"><input type="checkbox" checked={userForm.isActive} onChange={(event) => setUserForm({ ...userForm, isActive: event.target.checked })} /> حساب فعال باشد</label>
                  <button type="button" className="primary" disabled={saving} onClick={saveUser}><Save size={17} /> ذخیره کاربر</button>
                </div>
                {notice && <p className="success">{notice}</p>}
                <dl>
                  <dt>نام کامل</dt><dd>{selectedProfile.fullName}</dd>
                  <dt>نام کاربری</dt><dd>{selectedProfile.username}</dd>
                  <dt>ایمیل</dt><dd>{selectedProfile.email || '-'}</dd>
                  <dt>موبایل</dt><dd>{selectedProfile.phoneNumber || '-'}</dd>
                  <dt>وضعیت</dt><dd>{selectedProfile.isActive ? 'فعال' : 'در انتظار تایید'}</dd>
                  <dt>نقش</dt><dd>{selectedProfile.isAdmin ? 'Admin' : 'Customer'}</dd>
                  <dt>تاریخ عضویت</dt><dd>{formatDate(detail.createdAt)}</dd>
                  <dt>آخرین سفارش</dt><dd>{formatDate(detail.lastOrderAt)}</dd>
                </dl>
              </div>

              <div className="section-card admin-address-list">
                <div className="section-heading">
                  <h2>آدرس‌های کاربر</h2>
                  <span>{selectedProfile.addresses.length} آدرس</span>
                </div>
                {selectedProfile.addresses.map((address) => (
                  <div className="admin-address-card" key={address.id}>
                    <strong>{address.title} {address.isDefault && <span>پیش‌فرض</span>}</strong>
                    <p>{address.province}، {address.city}، {address.street}</p>
                    <small>گیرنده: {address.receiverName} / {address.receiverPhone}</small>
                    <small>کد پستی: {address.postalCode || '-'}</small>
                  </div>
                ))}
                {selectedProfile.addresses.length === 0 && <p className="muted-text">آدرسی ثبت نشده است.</p>}
              </div>
            </div>

            <div className="admin-user-grid wide">
              <div className="section-card admin-user-orders">
                <div className="section-heading">
                  <h2>گزارش خرید و سفارش‌ها</h2>
                  <span>{selectedOrders.length} سفارش</span>
                </div>
                {selectedOrders.map((order) => (
                  <div className="admin-user-order" key={order.id}>
                    <div className="admin-user-order-main">
                      <strong>{order.orderNumber}</strong>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="admin-user-order-status">
                      <span>وضعیت سفارش: {order.status}</span>
                      <span>وضعیت پرداخت: {order.paymentStatus}</span>
                    </div>
                    <div className="admin-user-order-total">
                      <strong>{money(order.grandTotal)}</strong>
                      <span>{order.items.length} ردیف کالا</span>
                    </div>
                    <div className="order-items-inline">
                      {order.items.map((item) => (
                        <span key={`${order.id}-${item.productId}`}>{item.productName} × {item.quantity}</span>
                      ))}
                    </div>
                    {order.invoice && (
                      <div className="invoice-inline">
                        فاکتور: {order.invoice.invoiceNumber} / {money(order.invoice.payableAmount)} / {formatDate(order.invoice.issuedAt)}
                      </div>
                    )}
                  </div>
                ))}
                {selectedOrders.length === 0 && <p className="muted-text">خریدی برای این کاربر ثبت نشده است.</p>}
              </div>

              <div className="section-card admin-activity-list">
                <div className="section-heading">
                  <h2>سوابق فعالیت</h2>
                  <span>{detail.activities.length} رخداد</span>
                </div>
                {detail.activities.map((activity, index) => (
                  <div className={`activity-item ${activity.type}`} key={`${activity.occurredAt}-${index}`}>
                    <span />
                    <div>
                      <strong>{activity.title}</strong>
                      <p>{activity.description}</p>
                      <small>{formatDate(activity.occurredAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return <div className="stat"><Icon size={22} /><span>{label}</span><strong>{value}</strong></div>;
}
