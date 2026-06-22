import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductQuery, ProductSummaryDto } from './api';

export type ViewKey = 'home' | 'product' | 'cart' | 'profile' | 'orders' | 'articles' | 'about' | 'contact' | 'faq' | 'admin';

export type CartItem = ProductSummaryDto & {
  quantity: number;
};

type ShopState = {
  cart: CartItem[];
  activeView: ViewKey;
  selectedSlug: string | null;
  filters: ProductQuery;
  setActiveView: (activeView: ViewKey) => void;
  openProduct: (selectedSlug: string) => void;
  setFilters: (filters: Partial<ProductQuery>) => void;
  addToCart: (product: ProductSummaryDto) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: () => number;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      activeView: 'home',
      selectedSlug: null,
      filters: { search: '', categoryId: '', sort: 'newest' },
      setActiveView: (activeView) => set({ activeView }),
      openProduct: (selectedSlug) => set({ selectedSlug, activeView: 'product' }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return { cart: state.cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)) };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => ({ cart: state.cart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)) })),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    { name: 'shopsuite-cart' },
  ),
);
