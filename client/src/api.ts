const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5011/api';

export type CategoryDto = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description?: string | null;
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
  fullName: string;
  email: string;
  phoneNumber: string;
  isAdmin: boolean;
  addresses: AddressDto[];
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

export type CreateOrderPayload = {
  userId: string;
  addressId: string | null;
  notes?: string | null;
  items: Array<{ productId: string; quantity: number }>;
};

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

function normalizeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeProductPayload(payload: UpsertProductPayload): UpsertProductPayload {
  return {
    ...payload,
    price: normalizeNumber(payload.price, 0),
    compareAtPrice: normalizeNullableNumber(payload.compareAtPrice),
    stockQuantity: normalizeNumber(payload.stockQuantity, 0),
    isFeatured: Boolean(payload.isFeatured),
    imageUrls: (payload.imageUrls ?? []).map((x) => String(x).trim()).filter(Boolean),
    specifications: (payload.specifications ?? [])
      .map((spec, index) => ({
        key: String(spec.key ?? '').trim(),
        value: String(spec.value ?? '').trim(),
        sortOrder: normalizeNumber(spec.sortOrder, index + 1),
      }))
      .filter((spec) => spec.key && spec.value),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
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
  getCategories: () => request<CategoryDto[]>('/categories'),
  getProducts: (params: ProductQuery = {}) => request<ProductsResponse>(`/products?${toQueryString(params)}`),
  getBestSellers: () => request<ProductSummaryDto[]>('/products/best-sellers'),
  getProduct: (slug: string) => request<ProductDetailDto>(`/products/${slug}`),
  createProduct: (payload: UpsertProductPayload) =>
    request<{ id: string; slug: string }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(normalizeProductPayload(payload)),
    }),
  updateProfile: (userId: string, payload: Pick<UserProfileDto, 'fullName' | 'phoneNumber'>) =>
    request<UserProfileDto>(`/customers/${userId}/profile`, { method: 'PUT', body: JSON.stringify(payload) }),
  getProfile: (userId: string) => request<UserProfileDto>(`/customers/${userId}/profile`),
  addAddress: (userId: string, payload: Omit<AddressDto, 'id'>) =>
    request<AddressDto>(`/customers/${userId}/addresses`, { method: 'POST', body: JSON.stringify(payload) }),
  getOrders: (userId: string) => request<OrderDto[]>(`/customers/${userId}/orders`),
  createOrder: (payload: CreateOrderPayload) =>
    request<OrderDto>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getAdminOrders: () => request<OrderDto[]>('/admin/orders'),
  getDashboard: () => request<DashboardDto>('/admin/dashboard'),
  getArticles: () => request<ArticleDto[]>('/articles'),
  getAbout: () => request<{ title: string; body: string; supportPhone: string; email: string }>('/about'),
};

export const sampleUserId = 'cccccccc-cccc-cccc-cccc-ccccccccccc2';
