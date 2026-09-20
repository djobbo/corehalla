import { createClient } from "@supabase/supabase-js"
export type { Session, User } from "@supabase/supabase-js"

/**
 * Browser Supabase client.
 *
 * Vite exposes only the configured env prefixes, so the public URL and anon
 * key are read through `import.meta.env`. Both the `VITE_` and the legacy
 * `NEXT_PUBLIC_` names are accepted so the deployed environment does not have
 * to change during the cutover.
 *
 * `createClient` throws on empty credentials at module scope, which would break
 * SSR for an app that simply has analytics/auth disabled. Placeholders keep the
 * module importable; unauthenticated calls fail the same way they did before.
 */
const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ??
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ??
    "http://localhost:54321"

const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "public-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
