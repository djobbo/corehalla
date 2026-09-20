import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

export type { Session, User } from "@supabase/supabase-js"

/**
 * Browser Supabase client.
 *
 * v2 `createClient` throws on an empty URL or key at construction time, so a
 * module-scope client built from unset variables breaks every build/SSR render
 * that merely imports this module. Placeholders keep it importable; calls that
 * need a real project still fail, just at the call site.
 */
const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321"

const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
