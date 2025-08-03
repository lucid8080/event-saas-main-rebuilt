import Stripe from "stripe"
import "server-only"

import { env } from "@/env.mjs"

export const stripe = new Stripe(env.STRIPE_API_KEY, {
  apiVersion: "2024-04-10",
  typescript: true,
})

export async function getCustomerBalance(customerId: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    // Balance is stored in cents, convert to dollars
    return (customer.balance || 0) / 100;
  } catch (error) {
    console.error('Error fetching customer balance:', error);
    return 0;
  }
}
