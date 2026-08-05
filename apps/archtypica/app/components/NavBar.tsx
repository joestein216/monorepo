// src/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '../store/useCartStore';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const [mounted, setMounted] = useState(false);

   // Prevent hydration mismatch — schedule mount state update asynchronously
  useEffect(() => {
    // Use requestAnimationFrame to avoid setting state synchronously in the effect,
    // which can trigger cascading renders.
    const rafId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="flex items-center justify-between pt-6 pb-2 border-b">
        <Link href="/" className="text-4xl [font-variant-caps:small-caps]">
          ArchtypicA
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative px-2 py-1 my-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Cart
          {mounted && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </button>
      </nav>

      {/* Cart Drawer Component */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
