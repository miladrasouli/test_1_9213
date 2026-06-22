import type { CartItem } from '../../store/shopStore';
import type { ProductDetailDto, ProductSummaryDto } from '../../services/api';

export const asset = (path: string) => `/didikala/${path}`;

export const fallbackProducts = [
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
  if ('imageUrls' in product && product.imageUrls[0]?.startsWith('http')) return product.imageUrls[0];
  return fallbackProducts[index % fallbackProducts.length];
}
