import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Boxes, PackagePlus, ReceiptText, ShoppingBag } from 'lucide-react';
import {
  api,
  type CategoryDto,
  type DashboardDto,
  type OrderDto,
  type ProductSummaryDto,
  type UpsertProductPayload,
} from '../../services/api';
import { productImage } from '../../shared/lib/assets';
import { money } from '../../shared/lib/format';
import { parseSpecifications } from '../../shared/lib/specifications';
import { OrderList } from '../orders/OrderList';
import { productFormSchema, type ProductFormValues } from './productSchema';
import { Stat } from './Stat';

export function AdminView() {
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [adminProducts, setAdminProducts] = useState<ProductSummaryDto[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [specRows, setSpecRows] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);

  const { register, handleSubmit, reset } = useForm<ProductFormValues>({
    defaultValues: {
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
      imageUrls: '',
      specifications: '',
    },
  });

  const loadAdminData = () => {
    api.getDashboard().then(setDashboard).catch(() => setDashboard(null));
    api.getCategories().then(setCategories).catch(() => setCategories([]));
    api.getAdminOrders().then(setOrders).catch(() => setOrders([]));
    api.getProducts({ page: 1, pageSize: 100 }).then((result) => setAdminProducts(result.items)).catch(() => setAdminProducts([]));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const addSpecRow = () => setSpecRows((rows) => [...rows, { key: '', value: '' }]);

  const updateSpecRow = (index: number, field: 'key' | 'value', value: string) => {
    setSpecRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const removeSpecRow = (index: number) => {
    setSpecRows((rows) => (rows.length <= 1 ? [{ key: '', value: '' }] : rows.filter((_, rowIndex) => rowIndex !== index)));
  };

  const createProduct = async (values: ProductFormValues) => {
    setAdminMessage('');
    const validation = productFormSchema.safeParse(values);
    if (!validation.success) {
      setAdminMessage(validation.error.issues[0]?.message ?? 'اطلاعات محصول معتبر نیست.');
      return;
    }

    const manualSpecs = specRows
      .map((row, index) => ({ key: row.key.trim(), value: row.value.trim(), sortOrder: index + 1 }))
      .filter((row) => row.key && row.value);

    const textSpecs = parseSpecifications(values.specifications ?? '');

    const payload: UpsertProductPayload = {
      categoryId: values.categoryId,
      name: values.name.trim(),
      slug: values.slug.trim(),
      shortDescription: values.shortDescription?.trim() || values.name.trim(),
      description: values.description?.trim() || values.shortDescription?.trim() || values.name.trim(),
      brand: values.brand?.trim() || 'ShopSuite',
      price: Number(values.price),
      compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
      stockQuantity: Number(values.stockQuantity),
      isFeatured: Boolean(values.isFeatured),
      imageUrls: (values.imageUrls ?? '').split('\n').map((url) => url.trim()).filter(Boolean),
      specifications: manualSpecs.length > 0 ? manualSpecs : textSpecs,
    };

    try {
      await api.createProduct(payload);
      setAdminMessage('محصول با موفقیت ثبت شد.');
      reset();
      setSpecRows([{ key: '', value: '' }]);
      loadAdminData();
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : 'ثبت محصول ناموفق بود.');
    }
  };

  return (
    <section className="page admin-page">
      <div className="dashboard-grid">
        <Stat icon={Boxes} label="تعداد محصولات" value={dashboard?.productCount ?? 0} />
        <Stat icon={ShoppingBag} label="تعداد سفارش‌ها" value={dashboard?.orderCount ?? 0} />
        <Stat icon={ReceiptText} label="درآمد کل" value={money(dashboard?.totalSales ?? 0)} />
        <Stat icon={PackagePlus} label="کالاهای کم‌موجودی" value={adminProducts.filter((product) => product.stockQuantity <= 5).length} />
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
                  <option value={category.id} key={category.id}>{category.name}</option>
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
              <textarea {...register('imageUrls')} rows={4} placeholder="هر آدرس عکس را در یک خط وارد کنید" />
              <span className="admin-form-hint">هر URL تصویر در یک خط جداگانه قرار بگیرد.</span>
            </div>

            <div className="admin-form-field full">
              <label>توضیح کوتاه</label>
              <input {...register('shortDescription')} placeholder="یک توضیح کوتاه برای کارت محصول" />
              <span className="admin-form-hint">در لیست محصولات نمایش داده می‌شود.</span>
            </div>

            <div className="admin-form-field full">
              <label>توضیح کامل</label>
              <textarea {...register('description')} rows={5} placeholder="توضیحات کامل محصول" />
              <span className="admin-form-hint">در صفحه جزئیات محصول نمایش داده می‌شود.</span>
            </div>
          </div>

          <div className="product-spec-panel">
            <div className="product-spec-header">
              <div>
                <h3>مشخصات محصول</h3>
                <p>مثلاً رنگ، وزن، گارانتی، جنس بدنه، حافظه، سایز و...</p>
              </div>
              <button type="button" className="secondary" onClick={addSpecRow}>افزودن مشخصه</button>
            </div>

            <div className="product-spec-list">
              {specRows.map((row, index) => (
                <div className="product-spec-row" key={index}>
                  <input value={row.key} onChange={(event) => updateSpecRow(index, 'key', event.target.value)} placeholder="عنوان مشخصه، مثلا رنگ" />
                  <input value={row.value} onChange={(event) => updateSpecRow(index, 'value', event.target.value)} placeholder="مقدار، مثلا مشکی" />
                  <button type="button" className="danger-light" onClick={() => removeSpecRow(index)}>حذف</button>
                </div>
              ))}
            </div>
          </div>

          <label className="check"><input type="checkbox" {...register('isFeatured')} /> محصول ویژه</label>
          <button className="primary" type="submit">ثبت محصول</button>
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
}
