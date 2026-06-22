# ShopSuite Mobile

اپلیکیشن موبایل فروشگاه با Flutter و BLoC که به API همین پروژه وصل می‌شود.

## امکانات

- صفحه خانه با پرفروش‌ترین‌ها
- کاتالوگ محصولات با جستجو، دسته‌بندی و مرتب‌سازی
- جزئیات محصول و محصولات مشابه
- سبد خرید با Cubit
- ثبت سفارش و دریافت شماره فاکتور
- پروفایل کاربر، ویرایش اطلاعات و ثبت آدرس
- نمایش سوابق خرید و آیتم‌های سفارش
- اخبار و مقالات فروشگاه
- رابط فارسی و RTL
- تم didikala با فونت Shabnam، رنگ قرمز قالب و بنرهای قالب

## ساختار

```text
lib/
  blocs/       Cubit و Stateهای BLoC
  config/      تنظیمات API
  data/        Dio API client و Repository
  models/      مدل‌های JSON
  ui/          صفحه‌ها، ویجت‌ها، تم و formatterها
  assets/      فونت‌ها و تصاویر قالب didikala
```

## آماده‌سازی

اگر پوشه‌های platform مثل `android/` و `ios/` وجود ندارند، داخل همین پوشه اجرا کنید:

```powershell
flutter create .
```

سپس dependencyها را بگیرید:

```powershell
flutter pub get
```

## اجرای API

ابتدا بک‌اند را از ریشه پروژه اجرا کنید:

```powershell
dotnet run --no-build --project server\ShopApi\ShopApi.csproj --launch-profile http
```

API روی این آدرس بالا می‌آید:

```text
http://localhost:5010/api
```

## اجرای اپ

برای Android Emulator مقدار پیش‌فرض API این است:

```text
http://10.0.2.2:5010/api
```

برای iOS Simulator یا Windows می‌توانید هنگام اجرا مقدار API را override کنید:

```powershell
flutter run --dart-define=API_BASE_URL=http://localhost:5010/api
```

برای Android Emulator:

```powershell
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5010/api
```

## فایل‌های مهم

- `lib/main.dart`
- `lib/app.dart`
- `lib/data/shop_repository.dart`
- `lib/blocs/cart/cart_cubit.dart`
- `lib/ui/home_shell.dart`
- `lib/ui/screens/catalog_screen.dart`
- `lib/ui/screens/product_detail_screen.dart`
- `lib/ui/screens/cart_screen.dart`
- `lib/ui/screens/profile_screen.dart`
