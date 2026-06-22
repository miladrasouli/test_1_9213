import { asset } from '../../../shared/lib/assets';

export function Hero() {
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
