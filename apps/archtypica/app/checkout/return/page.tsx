// src/app/checkout/return/page.tsx
'use client';

import { useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';

export default function ReturnPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the Zustand store upon successful completion
    clearCart();
  }, [clearCart]);

  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-green-600">Thank you for your order!</h1>
      <p className="mt-2 text-gray-600">Your onsite transaction completed safely.</p>
    </div>
  );
}
