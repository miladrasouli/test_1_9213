import type { ProductDetailDto, ProductSummaryDto } from '../api';
import type { CartItem } from '../store';

export type ProductSpecInput = { key: string; value: string };

export const asset = (path: string) => `/didikala/${path}`;

export const money = (value: number | null | undefined) => `${new Intl.NumberFormat('fa-IR').format(value ?? 0)} تومان`;

const fallbackProducts = [
  asset('img/products/01.jpg'),
  asset('img/products/02.jpg'),
  asset('img/products/03.jpg'),
  asset('img/products/04.jpg'),
  asset('img/products/05.jpg'),
  asset('img/products/06.jpg'),
  asset('img/products/07.jpg'),
  asset('img/products/08.jpg'),
];

export function productImage(product: ProductSummaryDto | ProductDetailDto | CartItem, index = 0) {
  if ('primaryImageUrl' in product && product.primaryImageUrl?.startsWith('http')) return product.primaryImageUrl;
  if ('imageUrls' in product && product.imageUrls[0]) return product.imageUrls[0];
  return fallbackProducts[index % fallbackProducts.length];
}

export const defaultSpecs: ProductSpecInput[] = [
  { key: 'Color', value: 'Black' },
  { key: 'Warranty', value: '18 months' },
];
