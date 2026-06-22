import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('client/src');
const source = fs.readFileSync(path.join(root, 'main.tsx'), 'utf8');

const functionNames = [
  'App',
  'TopHeader',
  'HomeView',
  'Hero',
  'CategoryStrip',
  'ProductRail',
  'ProductGrid',
  'ProductCard',
  'ProductDetail',
  'CartView',
  'ProfileView',
  'OrdersView',
  'AdminView',
  'Stat',
  'OrderList',
  'ArticlesView',
  'AboutView',
  'ContactView',
  'FaqView',
  'Footer',
];

const positions = functionNames.map((name) => {
  const index = source.indexOf(`function ${name}`);
  if (index === -1) throw new Error(`Function ${name} not found`);
  return { name, index };
});

function block(name) {
  const current = positions.find((item) => item.name === name);
  const currentIndex = positions.indexOf(current);
  const next = positions[currentIndex + 1];
  const end = next ? next.index : source.indexOf('createRoot(');
  return source.slice(current.index, end).trim().replace(`function ${name}`, `export function ${name}`);
}

function ensureDir(dir) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(path.join(root, file), `${content.trim()}\n`, 'utf8');
}

write('utils/shop.ts', `
import type { ProductDetailDto, ProductSummaryDto } from '../api';
import type { CartItem } from '../store';

export type ProductSpecInput = { key: string; value: string };

export const asset = (path: string) => \`/didikala/\${path}\`;

export const money = (value: number | null | undefined) => \`\${new Intl.NumberFormat('fa-IR').format(value ?? 0)} تومان\`;

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
  if ('imageUrls' in product && product.imageUrls[0]?.startsWith('http')) return product.imageUrls[0];
  return fallbackProducts[index % fallbackProducts.length];
}

export const defaultSpecs: ProductSpecInput[] = [
  { key: 'Color', value: 'Black' },
  { key: 'Warranty', value: '18 months' },
];
`);

write('components/Layout.tsx', `
import type { FormEvent } from 'react';
import { FileText, HelpCircle, LayoutGrid, LogIn, LogOut, MapPin, Menu, Newspaper, Phone, ReceiptText, Search, ShoppingBag, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AuthUserDto, CategoryDto } from '../api';
import { useShopStore, type ViewKey } from '../store';
import { asset } from '../utils/shop';

export type NavItem = [ViewKey, string, LucideIcon];

${block('TopHeader')}

${block('Footer')}
`);

write('components/OrderList.tsx', `
import type { OrderDto } from '../api';
import { money } from '../utils/shop';

${block('OrderList')}
`);

write('components/ProductSections.tsx', `
import { useEffect, useState } from 'react';
import { ChevronLeft, Heart, ReceiptText, ShieldCheck, Truck } from 'lucide-react';
import { api, type ProductDetailDto, type ProductSummaryDto } from '../api';
import { useShopStore } from '../store';
import { asset, money, productImage } from '../utils/shop';

${block('ProductRail')}

${block('ProductGrid')}

${block('ProductCard')}

${block('ProductDetail')}
`);

write('pages/HomeView.tsx', `
import { useEffect, useState } from 'react';
import type { CategoryDto, ProductSummaryDto } from '../api';
import { api } from '../api';
import { useShopStore } from '../store';
import { asset } from '../utils/shop';
import { ProductGrid, ProductRail } from '../components/ProductSections';

${block('HomeView')}

${block('Hero')}

${block('CategoryStrip')}
`);

write('pages/CartView.tsx', `
import { useState } from 'react';
import { api } from '../api';
import { useShopStore } from '../store';
import { money, productImage } from '../utils/shop';

${block('CartView')}
`);

write('pages/ProfileView.tsx', `
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, MapPin } from 'lucide-react';
import { api, type UserProfileDto } from '../api';
import { useShopStore } from '../store';
import { asset } from '../utils/shop';

type AddressFormValues = Omit<UserProfileDto['addresses'][number], 'id'>;
type ProfileFormValues = Pick<UserProfileDto, 'fullName' | 'email' | 'phoneNumber'>;
type LoginFormValues = { email: string };

${block('ProfileView')}
`);

write('pages/OrdersView.tsx', `
import { useEffect, useState } from 'react';
import { api, type OrderDto } from '../api';
import { useShopStore } from '../store';
import { OrderList } from '../components/OrderList';

${block('OrdersView')}
`);

write('pages/AdminView.tsx', `
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, Boxes, PackagePlus, Plus, ReceiptText, Trash2 } from 'lucide-react';
import { api, type CategoryDto, type DashboardDto, type OrderDto, type ProductSummaryDto, type UpsertProductPayload } from '../api';
import { useShopStore } from '../store';
import { asset, defaultSpecs, money, productImage, type ProductSpecInput } from '../utils/shop';
import { OrderList } from '../components/OrderList';

type ProductFormValues = {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  brand: string;
  price: string;
  compareAtPrice?: string;
  stockQuantity: string;
  isFeatured?: boolean;
  imageUrls: string;
  specifications?: string;
};

${block('AdminView')}

${block('Stat')}
`);

write('pages/PublicPages.tsx', `
import { useEffect, useState } from 'react';
import { FileText, MapPin, Phone, ReceiptText, ShieldCheck, Truck, UserRound } from 'lucide-react';
import { api, type ArticleDto } from '../api';
import { useShopStore } from '../store';
import { asset } from '../utils/shop';

${block('ArticlesView')}

${block('AboutView')}

${block('ContactView')}

${block('FaqView')}
`);

write('App.tsx', `
import { type FormEvent, useEffect, useState } from 'react';
import { BarChart3, FileText, HelpCircle, Home, Newspaper, Phone, ReceiptText, ShoppingBag, UserRound } from 'lucide-react';
import { api, type CategoryDto } from './api';
import { useShopStore } from './store';
import { TopHeader, Footer, type NavItem } from './components/Layout';
import { ProductDetail } from './components/ProductSections';
import { HomeView } from './pages/HomeView';
import { CartView } from './pages/CartView';
import { ProfileView } from './pages/ProfileView';
import { OrdersView } from './pages/OrdersView';
import { AdminView } from './pages/AdminView';
import { AboutView, ArticlesView, ContactView, FaqView } from './pages/PublicPages';

${block('App')}
`);

write('main.tsx', `
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<App />);
`);
