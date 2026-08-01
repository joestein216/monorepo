import { createClient } from '@supabase/supabase-js';
import { type Database } from './database.types'; // Import the auto-generated types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Pass the Database type token into the client builder
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export * from '@supabase/supabase-js';
export type { Database };
