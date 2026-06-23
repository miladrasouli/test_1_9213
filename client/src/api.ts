const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5010/api';

export type CategoryDto = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description?: string | null;
};

export type AuthUserDto = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'Admin' | 'Customer' | string;
  isAdmin: boolean;
  isActive: boolean;
};

export type ProductSummaryDto = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string;
  brand: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  soldCount: number;
  rating: number;
  isFeatured: boolean;
  primaryImageUrl?: string | null;
};

export type ProductSpecificationDto = {
  id: string;
  key: string;
  value: string;
  sortOrder: number;
};

export type UploadedProductImageDto = {
  url: string;
  fileName: string;
};

export type ProductDetailDto = ProductSummaryDto & {
  description: string;
  imageUrls: string[];
  specifications: ProductSpecificationDto[];
  similarProducts: ProductSummaryDto[];
};

export type ProductQuery = {
  search?: string;
  categoryId?: string;
  sort?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
};

export type ProductsResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: ProductSummaryDto[];
};

export type AddressDto = {
  id: string;
  title: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
};

export type UserProfileDto = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isAdmin: boolean;
  isActive: boolean;
  addresses: AddressDto[];
};

export type AdminUserActivityDto = {
  occurredAt: string;
  type: string;
  title: string;
  description: string;
};

export type AdminUserDetailDto = {
  profile: UserProfileDto;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  paidTotal: number;
  lastOrderAt?: string | null;
  orders: OrderDto[];
  activities: AdminUserActivityDto[];
};

export type OrderDto = {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  status: number;
  paymentStatus: number;
  subtotal: number;
  shippingCost: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  createdAt: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  invoice?: {
    id: string;
    invoiceNumber: string;
    issuedAt: string;
    payableAmount: number;
  } | null;
};

export type ArticleDto = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverImageUrl: string;
  publishedAt: string;
};

export type DashboardDto = {
  productCount: number;
  categoryCount: number;
  orderCount: number;
  totalSales: number;
  bestSellers: ProductSummaryDto[];
  recentOrders: OrderDto[];
};

export type FooterLinkDto = {
  id: string;
  footerSectionId: string;
  label: string;
  viewKey: string;
  sortOrder: number;
  isActive: boolean;
};

export type FooterSectionDto = {
  id: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
  links: FooterLinkDto[];
};

export type SiteMenuItemDto = {
  id: string;
  location: string;
  label: string;
  viewKey: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

export type SiteSettingsDto = {
  topBannerImageUrl: string;
  topBannerLink: string;
  topBannerAlt: string;
  bestSellerTake: number;
};

export type CreateOrderPayload = {
  userId: string;
  addressId: string | null;
  notes?: string | null;
  items: Array<{ productId: string; quantity: number }>;
};

export type RegisterPayload = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
};

export type UpdateAdminUserPayload = Pick<UserProfileDto, 'fullName' | 'email' | 'phoneNumber' | 'isAdmin' | 'isActive'>;

export type UpsertProductPayload = {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isFeatured: boolean;
  imageUrls: string[];
  specifications: Array<{ key: string; value: string; sortOrder: number }>;
};

export type UpsertFooterSectionPayload = Omit<FooterSectionDto, 'id' | 'links'>;
export type UpsertFooterLinkPayload = Omit<FooterLinkDto, 'id'>;
export type UpsertSiteMenuItemPayload = Omit<SiteMenuItemDto, 'id'>;
export type UpsertSiteSettingsPayload = SiteSettingsDto;

async function request<T>(path: string, options: RequestInit & { userId?: string } = {}): Promise<T> {
  const { userId, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(userId ? { 'X-User-Id': userId } : {}), ...(fetchOptions.headers ?? {}) },
    ...fetchOptions,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'خطا در ارتباط با سرور');
  }

  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

function toQueryString(params: ProductQuery): string {
  return new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== '' && value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)]),
  ).toString();
}

export const api = {
  login: (username: string, password: string) => request<AuthUserDto>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (payload: RegisterPayload) => request<UserProfileDto>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: (userId: string) => request<AuthUserDto>('/auth/me', { userId }),
  getCategories: () => request<CategoryDto[]>('/categories'),
  getProducts: (params: ProductQuery = {}) => request<ProductsResponse>(`/products?${toQueryString(params)}`),
  getBestSellers: () => request<ProductSummaryDto[]>('/products/best-sellers'),
  getProduct: (slug: string) => request<ProductDetailDto>(`/products/${slug}`),
  uploadProductImages: async (files: File[], userId: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await fetch(`${API_BASE_URL}/admin/product-images`, {
      method: 'POST',
      headers: { 'X-User-Id': userId },
      body: formData,
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'خطا در آپلود تصاویر');
    }
    return response.json() as Promise<UploadedProductImageDto[]>;
  },
  createProduct: (payload: UpsertProductPayload, userId: string) => request<{ id: string; slug: string }>('/admin/products', { method: 'POST', body: JSON.stringify(payload), userId }),
  updateProduct: (id: string, payload: UpsertProductPayload, userId: string) => request<void>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload), userId }),
  deleteProduct: (id: string, userId: string) => request<void>(`/admin/products/${id}`, { method: 'DELETE', userId }),
  updateProfile: (userId: string, payload: Pick<UserProfileDto, 'fullName' | 'email' | 'phoneNumber'>) => request<void>(`/customers/${userId}/profile`, { method: 'PUT', body: JSON.stringify(payload) }),
  getProfile: (userId: string) => request<UserProfileDto>(`/customers/${userId}/profile`),
  addAddress: (userId: string, payload: Omit<AddressDto, 'id'>) => request<AddressDto>(`/customers/${userId}/addresses`, { method: 'POST', body: JSON.stringify(payload) }),
  getOrders: (userId: string) => request<OrderDto[]>(`/customers/${userId}/orders`),
  createOrder: (payload: CreateOrderPayload) => request<OrderDto>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getAdminOrders: (userId: string) => request<OrderDto[]>('/admin/orders', { userId }),
  getAdminUsers: (userId: string) => request<UserProfileDto[]>('/admin/users', { userId }),
  getAdminUserDetail: (targetUserId: string, userId: string) => request<AdminUserDetailDto>(`/admin/users/${targetUserId}`, { userId }),
  updateAdminUser: (targetUserId: string, payload: UpdateAdminUserPayload, userId: string) => request<void>(`/admin/users/${targetUserId}`, { method: 'PUT', body: JSON.stringify(payload), userId }),
  getDashboard: (userId: string) => request<DashboardDto>('/admin/dashboard', { userId }),
  getArticles: () => request<ArticleDto[]>('/articles'),
  getFooter: () => request<FooterSectionDto[]>('/footer'),
  getMenus: (location?: string) => request<SiteMenuItemDto[]>(`/menus${location ? `?location=${encodeURIComponent(location)}` : ''}`),
  getSiteSettings: () => request<SiteSettingsDto>('/site-settings'),
  getAdminSiteSettings: (userId: string) => request<SiteSettingsDto>('/admin/site-settings', { userId }),
  updateSiteSettings: (payload: UpsertSiteSettingsPayload, userId: string) => request<void>('/admin/site-settings', { method: 'PUT', body: JSON.stringify(payload), userId }),
  getAdminFooterSections: (userId: string) => request<FooterSectionDto[]>('/admin/footer-sections', { userId }),
  createFooterSection: (payload: UpsertFooterSectionPayload, userId: string) => request<FooterSectionDto>('/admin/footer-sections', { method: 'POST', body: JSON.stringify(payload), userId }),
  updateFooterSection: (id: string, payload: UpsertFooterSectionPayload, userId: string) => request<void>(`/admin/footer-sections/${id}`, { method: 'PUT', body: JSON.stringify(payload), userId }),
  deleteFooterSection: (id: string, userId: string) => request<void>(`/admin/footer-sections/${id}`, { method: 'DELETE', userId }),
  createFooterLink: (payload: UpsertFooterLinkPayload, userId: string) => request<FooterLinkDto>('/admin/footer-links', { method: 'POST', body: JSON.stringify(payload), userId }),
  updateFooterLink: (id: string, payload: UpsertFooterLinkPayload, userId: string) => request<void>(`/admin/footer-links/${id}`, { method: 'PUT', body: JSON.stringify(payload), userId }),
  deleteFooterLink: (id: string, userId: string) => request<void>(`/admin/footer-links/${id}`, { method: 'DELETE', userId }),
  getAdminMenus: (userId: string) => request<SiteMenuItemDto[]>('/admin/menus', { userId }),
  createMenuItem: (payload: UpsertSiteMenuItemPayload, userId: string) => request<SiteMenuItemDto>('/admin/menus', { method: 'POST', body: JSON.stringify(payload), userId }),
  updateMenuItem: (id: string, payload: UpsertSiteMenuItemPayload, userId: string) => request<void>(`/admin/menus/${id}`, { method: 'PUT', body: JSON.stringify(payload), userId }),
  deleteMenuItem: (id: string, userId: string) => request<void>(`/admin/menus/${id}`, { method: 'DELETE', userId }),
  getAbout: () => request<{ title: string; body: string; supportPhone: string; email: string }>('/about'),
};

export const sampleUserId = 'cccccccc-cccc-cccc-cccc-ccccccccccc2';
