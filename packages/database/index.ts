import {
  createClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js"

import type { Database } from "./database.types"

export type DatabaseClientConfig = {
  url: string | undefined
  publishableKey: string | undefined
  options?: SupabaseClientOptions<"public">
}

export function createDatabaseClient({
  url,
  publishableKey,
  options,
}: DatabaseClientConfig) {
  if (!url) {
    throw new Error(
      "Supabase URL is required. Set NEXT_PUBLIC_SUPABASE_URL in the consuming app.",
    )
  }

  if (!publishableKey) {
    throw new Error(
      "Supabase publishable key is required. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the consuming app.",
    )
  }

  return createClient<Database>(url, publishableKey, options)
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>
export type { Database }
