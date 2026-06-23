import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, MapPin, UserPlus } from 'lucide-react';
import { api, type UserProfileDto } from '../api';
import { useShopStore } from '../store';
import { asset } from '../utils/shop';

type AddressFormValues = Omit<UserProfileDto['addresses'][number], 'id'>;
type ProfileFormValues = Pick<UserProfileDto, 'fullName' | 'email' | 'phoneNumber'>;
type LoginFormValues = { username: string; password: string };
type RegisterFormValues = { username: string; password: string; fullName: string; email: string; phoneNumber: string };

export function ProfileView() {
  const { currentUser, login, logout } = useShopStore();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const { register, handleSubmit, reset } = useForm<ProfileFormValues>();
  const loginForm = useForm<LoginFormValues>({ defaultValues: { username: 'admin', password: 'Admin@123' } });
  const registerForm = useForm<RegisterFormValues>();
  const addressForm = useForm<AddressFormValues>();
  const [loginMessage, setLoginMessage] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    api.getProfile(currentUser.id).then((data) => {
      setProfile(data);
      reset(data);
    });
  }, [currentUser, reset]);

  const submitLogin = (values: LoginFormValues) => api.login(values.username, values.password)
    .then((user) => {
      login(user);
      setLoginMessage(`با نقش ${user.role} وارد شدید.`);
    })
    .catch((error: Error) => setLoginMessage(error.message || 'نام کاربری یا رمز عبور اشتباه است.'));

  const submitRegister = (values: RegisterFormValues) => api.register(values)
    .then(() => {
      registerForm.reset();
      setAuthMode('login');
      setLoginMessage('ثبت‌نام انجام شد. حساب شما بعد از تعیین نقش و فعال‌سازی توسط مدیر قابل ورود است.');
    })
    .catch((error: Error) => setLoginMessage(error.message));

  const saveProfile = (values: ProfileFormValues) => currentUser
    ? api.updateProfile(currentUser.id, values).then(() => api.getProfile(currentUser.id).then(setProfile))
    : Promise.resolve();
  const saveAddress = (values: AddressFormValues) => currentUser
    ? api.addAddress(currentUser.id, { ...values, isDefault: Boolean(values.isDefault) }).then(() => api.getProfile(currentUser.id).then(setProfile))
    : Promise.resolve();

  if (!currentUser) {
    return (
      <section className="page">
        <div className="auth-layout">
          <div className="auth-visual" style={{ backgroundImage: `url(${asset('img/theme/page-cover.jpg')})` }}>
            <strong>ShopSuite</strong>
            <h1>ورود به حساب فروشگاهی</h1>
            <p>بعد از ثبت‌نام، مدیر سایت حساب را فعال و نقش کاربر را مشخص می‌کند.</p>
          </div>
          <div className="section-card auth-card">
            <div className="auth-tabs">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}><LogIn size={17} /> ورود</button>
              <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}><UserPlus size={17} /> ثبت‌نام</button>
            </div>
            {authMode === 'login' && (
              <form className="form-grid" onSubmit={loginForm.handleSubmit(submitLogin)}>
                <h2>ورود کاربر</h2>
                <input placeholder="نام کاربری" {...loginForm.register('username')} />
                <input placeholder="رمز عبور" type="password" {...loginForm.register('password')} />
                <div className="login-hints">
                  <button type="button" className="secondary" onClick={() => {
                    loginForm.setValue('username', 'admin');
                    loginForm.setValue('password', 'Admin@123');
                  }}>ورود مدیر</button>
                  <button type="button" className="secondary" onClick={() => {
                    loginForm.setValue('username', 'customer');
                    loginForm.setValue('password', 'Customer@123');
                  }}>ورود مشتری</button>
                </div>
                <button className="primary">ورود</button>
              </form>
            )}
            {authMode === 'register' && (
              <form className="form-grid" onSubmit={registerForm.handleSubmit(submitRegister)}>
                <h2>ثبت‌نام کاربر جدید</h2>
                <input placeholder="نام کامل" {...registerForm.register('fullName')} />
                <input placeholder="نام کاربری" {...registerForm.register('username')} />
                <input placeholder="ایمیل" type="email" {...registerForm.register('email')} />
                <input placeholder="شماره تماس" {...registerForm.register('phoneNumber')} />
                <input placeholder="رمز عبور" type="password" {...registerForm.register('password')} />
                <button className="primary">ثبت‌نام و انتظار تایید مدیر</button>
              </form>
            )}
            {loginMessage && <p className="success">{loginMessage}</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page profile-layout">
      <aside className="profile-menu">
        <img src={asset('img/theme/avatar.png')} alt="" />
        <strong>{profile?.fullName ?? 'کاربر فروشگاه'}</strong>
        <span>{profile?.phoneNumber}</span>
        <span>{profile?.role}</span>
        <button onClick={logout}>خروج</button>
        <button>اطلاعات حساب</button>
        <button>آدرس‌ها</button>
        <button>سفارش‌ها</button>
      </aside>
      <div className="profile-content">
        <div className="section-card account-summary">
          <h2>اطلاعات حساب</h2>
          <div>
            <span>نام کاربری</span>
            <strong>{profile?.username}</strong>
          </div>
          <div>
            <span>نقش کاربر</span>
            <strong>{profile?.role}</strong>
          </div>
          <div>
            <span>ایمیل</span>
            <strong>{profile?.email}</strong>
          </div>
          <div>
            <span>شماره تماس</span>
            <strong>{profile?.phoneNumber}</strong>
          </div>
        </div>
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
            {profile?.addresses.length === 0 && <div className="empty-cart">هنوز آدرسی برای این حساب ثبت نشده است.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
