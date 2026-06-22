# ShopSuite

یک نمونه فروشگاه اینترنتی کامل با بک‌اند `ASP.NET Core Web API`، دیتابیس `SQL Server` و فرانت `React` است.

## امکانات

- دسته‌بندی محصولات و زیر‌دسته
- لیست محصولات با جستجو، مرتب‌سازی و فیلتر دسته‌بندی
- جزئیات محصول، تصاویر، موجودی، امتیاز و محصولات مشابه
- پرفروش‌ترین‌ها
- سبد خرید با Zustand
- ثبت سفارش، کاهش موجودی، ثبت سوابق خرید و صدور فاکتور
- پروفایل مشتری و ثبت آدرس با React Hook Form
- پنل مدیریت برای داشبورد، سوابق فروش و ثبت محصول
- اخبار و مقالات
- صفحه درباره ما
- EF Core با SQL Server و seed data فارسی

## ساختار پروژه

```text
server/ShopApi   ASP.NET Core Web API + EF Core
client           React + TypeScript/TSX + Vite + Zustand + React Hook Form
mobile/shopsuite_mobile Flutter + BLoC mobile app
```

## اپلیکیشن موبایل Flutter

اپ موبایل در مسیر `mobile/shopsuite_mobile` قرار دارد. اگر Flutter روی سیستم نصب است:

```powershell
cd mobile\shopsuite_mobile
flutter create .
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5010/api
```

برای اجرای روی Windows یا iOS Simulator از `http://localhost:5010/api` استفاده کنید.

## قالب didikala

قالب `126685-update-3.2.zip` بررسی و روی پروژه اعمال شد:

- assetهای وب در `client/public/didikala`
- فونت Shabnam و بنرها/تصاویر قالب در فرانت React
- هدر، منوی دسته‌بندی، بنر اصلی، کارت محصول، صفحه جزئیات، سبد خرید، پروفایل، سفارش‌ها و پنل مدیریت با سبک didikala
- assetهای موبایل در `mobile/shopsuite_mobile/assets/didikala`
- تم Flutter با فونت Shabnam، رنگ اصلی قالب و بنر didikala

برای اجرای فرانت:

```powershell
cd client
pnpm dev
```

اگر فرانت را روی `http://127.0.0.1:5173` اجرا می‌کنید، CORS بک‌اند برای همین آدرس هم تنظیم شده است.

## اجرای بک‌اند

Connection string در فایل زیر تنظیم شده است:

```text
server/ShopApi/appsettings.json
```

پیش‌فرض روی SQL Server LocalDB است:

```text
Server=(localdb)\MSSQLLocalDB;Database=ShopSuiteDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True
```

دستور اجرا:

```powershell
dotnet restore ShopSuite.slnx
dotnet run --project server\ShopApi\ShopApi.csproj
```

در حالت Development اکنون `UseInMemoryDatabase` غیرفعال است و API به SQL Server محلی وصل می‌شود. دیتابیس با `EnsureCreated` ساخته و seed می‌شود.

## اجرای فرانت

در این محیط Node عمومی در PATH نبود، ولی pnpm داخلی Codex استفاده شد. روی سیستم خودتان اگر Node نصب است:

```powershell
cd client
pnpm install
pnpm dev
```

اگر آدرس HTTPS بک‌اند متفاوت بود، این مقدار را برای Vite تنظیم کنید:

```text
VITE_API_BASE_URL=http://localhost:5010/api
```

## مسیرهای مهم API

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/best-sellers`
- `GET /api/products/{slug}`
- `POST /api/orders`
- `GET /api/customers/{userId}/profile`
- `POST /api/customers/{userId}/addresses`
- `GET /api/customers/{userId}/orders`
- `GET /api/admin/dashboard`
- `GET /api/admin/orders`
- `POST /api/admin/products`
- `GET /api/articles`
- `GET /api/about`

## کاربر نمونه

```text
CustomerId: cccccccc-cccc-cccc-cccc-ccccccccccc2
Admin: admin@shopsuite.local
Customer: customer@shopsuite.local
```

## بررسی انجام‌شده

```powershell
dotnet build ShopSuite.slnx --no-restore
pnpm build
```

هر دو build موفق شدند. ابزار `dotnet-ef` روی سیستم نصب نبود؛ اگر خواستید migration رسمی بسازید:

```powershell
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate --project server\ShopApi\ShopApi.csproj --startup-project server\ShopApi\ShopApi.csproj
dotnet ef database update --project server\ShopApi\ShopApi.csproj --startup-project server\ShopApi\ShopApi.csproj
```
