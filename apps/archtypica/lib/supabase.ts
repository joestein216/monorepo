import { createDatabaseClient } from "@repo/database"

export function createSupabaseClient() {
  return createDatabaseClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  })
}
