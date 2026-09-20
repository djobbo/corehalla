import { supabase } from "./client"

export const signIn = async () => {
    // v2 renamed `auth.signIn` to `auth.signInWithOAuth` and moved the options
    // under `options`. `scopes` must stay a space-separated string.
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
            scopes: "identify email connections guilds",
            redirectTo: window.location.href,
        },
    })

    if (error) throw new Error(error.message)
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) throw new Error(error.message)
}
