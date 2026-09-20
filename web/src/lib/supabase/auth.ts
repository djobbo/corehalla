import { supabase } from "./client"

export const signIn = async () => {
    const { error } = await supabase.auth.signIn(
        { provider: "discord" },
        {
            scopes: "identify email connections guilds",
            redirectTo: window.location.href,
        },
    )

    if (error) throw new Error(error.message)
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) throw new Error(error.message)
}
