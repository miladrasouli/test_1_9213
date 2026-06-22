import { useEffect, useState } from 'react';
import { ReceiptText, ShieldCheck, Truck, UserRound } from 'lucide-react';
import { api } from '../../services/api';
import { asset } from '../../shared/lib/assets';

export function AboutView() {
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
