import { createClient } from "@supabase/supabase-js"
export type { Session, User } from "@supabase/supabase-js"

const publicEnv = (key: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY") => {
    const fromMeta =
        typeof import.meta !== "undefined"
            ? (
                  import.meta.env as unknown as Record<
                      string,
                      string | undefined
                  >
              )[key]
            : undefined
    return fromMeta ?? process.env[key] ?? ""
}

export const supabase = createClient(
    publicEnv("VITE_SUPABASE_URL"),
    publicEnv("VITE_SUPABASE_ANON_KEY"),
)
