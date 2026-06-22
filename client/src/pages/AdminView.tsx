import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, Boxes, PackagePlus, Plus, ReceiptText, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api, type CategoryDto, type DashboardDto, type OrderDto, type ProductSummaryDto, type UploadedProductImageDto, type UpsertProductPayload } from '../api';
import { useShopStore } from '../store';
import { defaultSpecs, money, productImage, type ProductSpecInput } from '../utils/shop';
import { OrderList } from '../components/OrderList';

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
  specifications?: string;
};

type IconComponent = LucideIcon;

export function AdminView() {
  const { currentUser, setActiveView } = useShopStore();
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [adminProducts, setAdminProducts] = useState<ProductSummaryDto[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const { register, handleSubmit, reset } = useForm<ProductFormValues>();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [specRows, setSpecRows] = useState<ProductSpecInput[]>(defaultSpecs);
  const [uploadedImages, setUploadedImages] = useState<UploadedProductImageDto[]>([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const reloadAdminData = () => {
    if (!currentUser?.isAdmin) return;
    api.getDashboard(currentUser.id).then(setDashboard);
    api.getAdminOrders(currentUser.id).then(setOrders);
    api.getCategories().then(setCategories);
    api.getProducts({ pageSize: 48, sort: 'newest' }).then((result) => setAdminProducts(result.items));
  };

  useEffect(() => {
    reloadAdminData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="page">
        <div className="section-card public-panel">
          <h2>برای ورود به پنل مدیریت ابتدا لاگین کنید</h2>
          <button className="primary" onClick={() => setActiveView('profile')}>ورود کاربر</button>
        </div>
      </section>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <section className="page">
        <div className="section-card public-panel">
          <h2>دسترسی مدیریتی ندارید</h2>
          <p>فقط کاربر با نقش Admin می‌تواند محصول، مشخصات محصول و داده‌های مدیریتی ثبت کند.</p>
          <button className="primary" onClick={() => setActiveView('profile')}>تغییر کاربر</button>
        </div>
      </section>
    );
  }

  const createProduct = (values: ProductFormValues) => {
    if (uploadedImages.length === 0 || !primaryImageUrl) {
      setUploadMessage('برای ثبت محصول حداقل یک تصویر آپلود و عکس اصلی را انتخاب کنید.');
      return;
    }

    const payload: UpsertProductPayload = {
      categoryId: values.categoryId,
      name: values.name,
      slug: values.slug,
      shortDescription: values.shortDescription,
      description: values.description,
      brand: values.brand,
      price: Number(values.price),
      compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
      stockQuantity: Number(values.stockQuantity),
      isFeatured: Boolean(values.isFeatured),
      imageUrls: [
        primaryImageUrl,
        ...uploadedImages.map((image) => image.url).filter((url) => url !== primaryImageUrl),
      ].filter(Boolean),
      specifications: specRows
        .map((spec, index) => ({ key: spec.key.trim(), value: spec.value.trim(), sortOrder: index + 1 }))
        .filter((spec) => spec.key && spec.value),
    };
    api.createProduct(payload, currentUser.id).then((created) => {
      setAdminMessage(`محصول با اسلاگ ${created.slug} ثبت شد.`);
      reset();
      setUploadedImages([]);
      setPrimaryImageUrl('');
      setSpecRows(defaultSpecs);
      reloadAdminData();
    });
  };

  const uploadImages = (files: FileList | null) => {
    if (!files?.length) return;
    setUploadMessage('در حال آپلود تصاویر...');
    api.uploadProductImages(Array.from(files), currentUser.id)
      .then((images) => {
        const nextImages = [...uploadedImages, ...images];
        setUploadedImages(nextImages);
        setPrimaryImageUrl((current) => current || nextImages[0]?.url || '');
        setUploadMessage(`${images.length} تصویر آپلود شد.`);
      })
      .catch((error: Error) => setUploadMessage(error.message));
  };

  return (
    <section className="page">
      <div className="stats">
        <Stat icon={Boxes} label="محصولات" value={dashboard?.productCount ?? 0} />
        <Stat icon={ReceiptText} label="سفارش‌ها" value={dashboard?.orderCount ?? 0} />
        <Stat icon={BarChart3} label="فروش کل" value={money(dashboard?.totalSales ?? 0)} />
      </div>
      <div className="admin-layout">
        <form className="section-card form-grid" onSubmit={handleSubmit(createProduct)}>
          <h2><PackagePlus size={18} /> ثبت محصول</h2>
          {adminMessage && <p className="success">{adminMessage}</p>}
          <select {...register('categoryId')}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
          {[
            ['name', 'نام محصول'],
            ['slug', 'اسلاگ'],
            ['shortDescription', 'توضیح کوتاه'],
            ['description', 'توضیح کامل'],
            ['brand', 'برند'],
            ['price', 'قیمت'],
            ['compareAtPrice', 'قیمت قبل'],
            ['stockQuantity', 'موجودی'],
          ].map(([field, label]) => <input key={field} placeholder={label} {...register(field as keyof ProductFormValues)} />)}
          <div className="form-field full image-uploader">
            <span>تصاویر محصول</span>
            <small>چند تصویر انتخاب کنید؛ یکی را به عنوان عکس اصلی مشخص کنید و بقیه در گالری نمایش داده می‌شوند.</small>
            <input type="file" accept="image/*" multiple onChange={(event) => uploadImages(event.target.files)} />
            {uploadMessage && <p className="success">{uploadMessage}</p>}
            <div className="uploaded-image-grid">
              {uploadedImages.map((image) => (
                <label className={primaryImageUrl === image.url ? 'uploaded-image primary-image' : 'uploaded-image'} key={image.url}>
                  <img src={image.url} alt={image.fileName} />
                  <span>{image.fileName}</span>
                  <input
                    type="radio"
                    name="primaryImage"
                    checked={primaryImageUrl === image.url}
                    onChange={() => setPrimaryImageUrl(image.url)}
                  />
                  <strong>{primaryImageUrl === image.url ? 'عکس اصلی' : 'گالری'}</strong>
                </label>
              ))}
            </div>
          </div>
          <div className="form-field full product-spec-editor">
            <div className="spec-editor-heading">
              <div>
                <span>ProductSpecifications - مشخصات محصول</span>
                <small>برای هر ویژگی یک Key و یک Value وارد کنید.</small>
              </div>
              <button type="button" className="secondary icon-button-text" onClick={() => setSpecRows([...specRows, { key: '', value: '' }])}>
                <Plus size={17} />
                افزودن مشخصه
              </button>
            </div>
            <div className="spec-editor-grid">
              <strong>Key</strong>
              <strong>Value</strong>
              <span />
              {specRows.map((spec, index) => (
                <div className="spec-editor-row" key={index}>
                  <input
                    placeholder="مثلا: رنگ"
                    value={spec.key}
                    onChange={(event) => setSpecRows(specRows.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item))}
                  />
                  <input
                    placeholder="مثلا: مشکی"
                    value={spec.value}
                    onChange={(event) => setSpecRows(specRows.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))}
                  />
                  <button type="button" className="secondary square-button" onClick={() => setSpecRows(specRows.filter((_, itemIndex) => itemIndex !== index))} aria-label="حذف مشخصه">
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <label className="form-field full legacy-spec-textarea">
            <span>ProductSpecifications - مشخصات محصول</span>
            <small>هر خط یک ویژگی باشد. مثال: رنگ: مشکی</small>
            <textarea placeholder="رنگ: مشکی&#10;گارانتی: ۱۸ ماه&#10;وزن: ۲۰۰ گرم" {...register('specifications')} />
          </label>
          <label className="check"><input type="checkbox" {...register('isFeatured')} /> محصول ویژه</label>
          <button className="primary">ثبت محصول</button>
        </form>
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
      </div>
    </section>
  );
}

export function Stat({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string | number }) {
  return <div className="stat"><Icon size={22} /><span>{label}</span><strong>{value}</strong></div>;
}
