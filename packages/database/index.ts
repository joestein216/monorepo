import { createClient } from '@supabase/supabase-js';

// Ensure runtime environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types cleanly for all apps to share
export * from '@supabase/supabase-js';
