// src/components/CartSidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '../store/useCartStore';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, removeItem, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — schedule mount state update asynchronously
  useEffect(() => {
    // Use requestAnimationFrame to avoid setting state synchronously in the effect,
    // which can trigger cascading renders.
    const rafId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  // Calculate totals (stored in cents)
  const totalCents = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalCents / 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Sidebar Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">Your Cart ({cart.length})</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const formattedItemPrice = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format((item.price * item.quantity) / 100);

                return (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formattedItemPrice}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 hover:underline mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Total:</span>
              <span>{formattedTotal}</span>
            </div>
            <div className="space-y-2">
              <a
                href="/checkout"
                onClick={onClose}
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Proceed to Checkout
              </a>
              <button
                onClick={clearCart}
                className="w-full text-sm text-gray-500 hover:text-red-500 py-2"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
