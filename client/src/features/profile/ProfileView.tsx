import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { api, sampleUserId, type UserProfileDto } from '../../services/api';
import { asset } from '../../shared/lib/assets';

type AddressFormValues = Omit<UserProfileDto['addresses'][number], 'id'>;
type ProfileFormValues = Pick<UserProfileDto, 'fullName' | 'email' | 'phoneNumber'>;

export function ProfileView() {
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
