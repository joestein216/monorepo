'use server';

import Stripe from 'stripe';
import { VinylRecordCartItem } from '../store/useCartStore';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia', // Use latest stable API version
});

export async function createCheckoutSession(cartItems: VinylRecordCartItem[]) {
  try {
    // Serialize data cleanly: extract only primitives (id, quantity)
    const securePayload = cartItems.map(item => ({
    price_data: {
        currency: "usd",
        unit_amount: item.price, // e.g., 2500 for $25.00
        product_data: {
          name: item.name,
          metadata: {
            productId: item.id, 
          },
        },
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page', // Critical for staying onsite
      mode: 'payment',
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      line_items: securePayload,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return { clientSecret: session.client_secret };
  } catch (error: unknown) {
    console.error('Stripe error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Stripe error');
  }
}
