// /app/store/useCartStore.tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VinylRecordCartItem {
  id: string;
  name: string;
  price: number; // Price in cents (e.g., $10.00 = 1000)
  quantity: number;
}

interface CartState {
  cart: VinylRecordCartItem[];
  addItem: (item: VinylRecordCartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      addItem: (newItem) =>
        set((state) => {
          const exists = state.cart.find((item) => item.id === newItem.id);
          if (exists) {
            return {
              cart: state.cart.map((item) =>
                item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { cart: [...state.cart, { ...newItem, quantity: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'archtypica-cart-storage' } // LocalStorage key
  )
);
