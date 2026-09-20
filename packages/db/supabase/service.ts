import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Server-only Supabase client (service role key).
 *
 * `@supabase/supabase-js` throws at construction time when the URL or key is
 * missing. Creating the client eagerly at module scope meant that importing any
 * module that transitively touched the database would crash the whole server —
 * including routes that never query Supabase.
 *
 * The client is now created on first use and exposed through a proxy so the
 * public shape (`supabaseService.from(...)`, `.rpc(...)`, …) is unchanged.
 * Configuration problems still surface, but only on the request that actually
 * needs database access.
 */
let client: SupabaseClient | null = null

const getServiceClient = (): SupabaseClient => {
    if (!client) {
        client = createClient(
            process.env.SUPABASE_URL ??
                process.env.NEXT_PUBLIC_SUPABASE_URL ??
                "",
            process.env.SUPABASE_SERVICE_KEY ?? "",
        )
    }

    return client
}

export const supabaseService = new Proxy({} as SupabaseClient, {
    get(_target, property, receiver) {
        return Reflect.get(getServiceClient(), property, receiver)
    },
})
