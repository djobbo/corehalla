import { createClient } from "@supabase/supabase-js"
export type { Session, User } from "@supabase/supabase-js"

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
)
