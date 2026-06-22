import { asset } from '../shared/lib/assets';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="main-container footer-inner">
        <img src={asset('img/logo.png')} alt="ShopSuite" />
        <span>فروشگاه نمونه ساخته‌شده با ASP.NET Core، React، TypeScript، Flutter و الگوی didikala</span>
      </div>
    </footer>
  );
}
