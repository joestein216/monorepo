// src/components/CheckoutForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/useCartStore';
import { createCheckoutSession } from '../actions/stripe';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutForm() {
  const { cart, clearCart } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length === 0) return;

    // Fetch the secret directly from our Server Action
    createCheckoutSession(cart)
      .then((res) => {
        clearCart(); // Clear the cart after creating the session 
        setClientSecret(res.clientSecret);
      })
      .catch((err) => console.error(err));
  }, [cart]);

  if (!clientSecret) return <div>Loading onsite checkout...</div>;

  return (
    <div id="checkout" className="">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
