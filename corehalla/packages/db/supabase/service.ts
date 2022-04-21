import { createClient } from "@supabase/supabase-js"

export const supabaseService = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_KEY ?? "",
)
