# تغییرات `client/src/main.tsx`

## 1) داخل `AdminView` نوع پیام را اضافه کن

این state فعلی را:

```tsx
const [adminMessage, setAdminMessage] = useState('');
```

با این جایگزین کن:

```tsx
const [adminMessage, setAdminMessage] = useState('');
const [adminMessageType, setAdminMessageType] = useState<'success' | 'error' | 'info'>('info');
```

---

## 2) `useForm` فرم محصول را اصلاح کن

این بخش را:

```tsx
const { register, handleSubmit, reset } = useForm<ProductFormValues>({
  defaultValues: productDefaultValues,
});
```

با این جایگزین کن:

```tsx
const {
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
} = useForm<ProductFormValues>({
  defaultValues: productDefaultValues,
  mode: 'onBlur',
});
```

---

## 3) دو helper کوچک قبل از `return` در `AdminView` اضافه کن

```tsx
const showError = (message: string) => {
  setAdminMessageType('error');
  setAdminMessage(message);
};

const showSuccess = (message: string) => {
  setAdminMessageType('success');
  setAdminMessage(message);
};
```

---

## 4) داخل `createProduct` پیام‌ها را واضح کن

داخل `createProduct` هرجا `setAdminMessage(...)` داری برای خطاها به `showError(...)` تبدیل کن.

مثلاً:

```tsx
setAdminMessage('لطفاً دسته‌بندی محصول را انتخاب کنید.');
```

بشود:

```tsx
showError('لطفاً دسته‌بندی محصول را انتخاب کنید.');
```

و در موفقیت:

```tsx
setAdminMessage(`محصول با اسلاگ ${created.slug} ثبت شد.`);
```

بشود:

```tsx
showSuccess(`محصول با اسلاگ ${created.slug} ثبت شد.`);
```

و در catch:

```tsx
setAdminMessage(error.message || 'ثبت محصول ناموفق بود.');
```

بشود:

```tsx
showError(error.message || 'ثبت محصول ناموفق بود.');
```

---

## 5) JSX فرم ثبت محصول را با این جایگزین کن

از `<form ...>` بخش ثبت محصول تا `</form>` را با این جایگزین کن:

```tsx
<form className="admin-product-form" onSubmit={handleSubmit(createProduct)} noValidate>
  {adminMessage && (
    <div className={`admin-message ${adminMessageType}`}>
      {adminMessage}
    </div>
  )}

  <div className="admin-form-grid">
    <div className={`admin-form-field full ${errors.categoryId ? 'has-error' : ''}`}>
      <label>
        انتخاب دسته‌بندی
        <span className="required-badge">الزامی</span>
      </label>
      <select
        {...register('categoryId', {
          required: 'لطفاً دسته‌بندی محصول را انتخاب کنید.',
        })}
      >
        <option value="">یک دسته‌بندی انتخاب کنید</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <span className="field-hint">محصول در همین دسته‌بندی در سایت نمایش داده می‌شود.</span>
      {errors.categoryId && <span className="field-error">{errors.categoryId.message}</span>}
    </div>

    <div className={`admin-form-field ${errors.name ? 'has-error' : ''}`}>
      <label>
        نام محصول
        <span className="required-badge">الزامی</span>
      </label>
      <input
        {...register('name', {
          required: 'نام محصول را وارد کنید.',
          minLength: { value: 2, message: 'نام محصول باید حداقل ۲ کاراکتر باشد.' },
        })}
        placeholder="مثلاً گوشی موبایل مدل X"
      />
      <span className="field-hint">این عنوان روی کارت محصول و صفحه جزئیات نمایش داده می‌شود.</span>
      {errors.name && <span className="field-error">{errors.name.message}</span>}
    </div>

    <div className={`admin-form-field ${errors.slug ? 'has-error' : ''}`}>
      <label>
        اسلاگ
        <span className="required-badge">الزامی</span>
      </label>
      <input
        {...register('slug', {
          required: 'اسلاگ محصول را وارد کنید.',
          minLength: { value: 2, message: 'اسلاگ باید حداقل ۲ کاراکتر باشد.' },
        })}
        placeholder="مثلاً mobile-x-256"
      />
      <span className="field-hint">اسلاگ نباید تکراری باشد؛ برای آدرس صفحه محصول استفاده می‌شود.</span>
      {errors.slug && <span className="field-error">{errors.slug.message}</span>}
    </div>

    <div className={`admin-form-field ${errors.brand ? 'has-error' : ''}`}>
      <label>برند</label>
      <input
        {...register('brand')}
        placeholder="مثلاً Samsung / Apple / ShopSuite"
      />
      <span className="field-hint">اگر خالی بماند، مقدار پیش‌فرض ShopSuite ثبت می‌شود.</span>
      {errors.brand && <span className="field-error">{errors.brand.message}</span>}
    </div>

    <div className={`admin-form-field ${errors.price ? 'has-error' : ''}`}>
      <label>
        قیمت
        <span className="required-badge">الزامی</span>
      </label>
      <input
        type="number"
        min="1"
        step="1000"
        {...register('price', {
          required: 'قیمت محصول را وارد کنید.',
          validate: (value) => Number(value) > 0 || 'قیمت باید بزرگ‌تر از صفر باشد.',
        })}
        placeholder="مثلاً 12500000"
      />
      <span className="field-hint">قیمت نهایی فروش به تومان.</span>
      {errors.price && <span className="field-error">{errors.price.message}</span>}
    </div>

    <div className="admin-form-field">
      <label>قیمت قبل</label>
      <input
        type="number"
        min="0"
        step="1000"
        {...register('compareAtPrice')}
        placeholder="مثلاً 14500000"
      />
      <span className="field-hint">اختیاری است؛ برای نمایش تخفیف استفاده می‌شود.</span>
    </div>

    <div className={`admin-form-field ${errors.stockQuantity ? 'has-error' : ''}`}>
      <label>
        موجودی
        <span className="required-badge">الزامی</span>
      </label>
      <input
        type="number"
        min="0"
        step="1"
        {...register('stockQuantity', {
          required: 'موجودی محصول را وارد کنید.',
          validate: (value) => Number(value) >= 0 || 'موجودی نمی‌تواند منفی باشد.',
        })}
        placeholder="مثلاً 20"
      />
      <span className="field-hint">اگر موجودی صفر باشد، محصول ناموجود محسوب می‌شود.</span>
      {errors.stockQuantity && <span className="field-error">{errors.stockQuantity.message}</span>}
    </div>

    <div className={`admin-form-field full ${errors.shortDescription ? 'has-error' : ''}`}>
      <label>توضیح کوتاه</label>
      <input
        {...register('shortDescription')}
        placeholder="یک توضیح کوتاه برای کارت محصول"
      />
      <span className="field-hint">در لیست محصولات و کارت محصول نمایش داده می‌شود.</span>
    </div>

    <div className={`admin-form-field full ${errors.description ? 'has-error' : ''}`}>
      <label>توضیح کامل</label>
      <textarea
        {...register('description')}
        placeholder="توضیحات کامل محصول، ویژگی‌ها و مزایا"
      />
      <span className="field-hint">در صفحه جزئیات محصول نمایش داده می‌شود.</span>
    </div>

    <div className="admin-form-field full">
      <label>آدرس تصاویر</label>
      <textarea
        {...register('imageUrls')}
        placeholder="هر آدرس تصویر را در یک خط وارد کنید"
      />
      <span className="field-hint">می‌توانی آدرس عکس‌های قالب یا URL کامل تصویر را وارد کنی؛ هر خط یک تصویر.</span>
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
          <button type="button" className="danger-light" onClick={() => removeSpecRow(index)}>
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

  <div className="form-actions">
    <button className="primary" type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'در حال ثبت...' : 'ثبت محصول'}
    </button>
    <button className="secondary" type="button" onClick={resetProductForm}>
      پاک کردن فرم
    </button>
  </div>
</form>
```
