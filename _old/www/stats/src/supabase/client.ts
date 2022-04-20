import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const signIn = async (): Promise<void> => {
    const { error } = await supabase.auth.signIn(
        {
            provider: 'discord',
        },
        {
            scopes: 'identify email connections guilds',
            redirectTo: window.location.href,
        },
    )

    if (error) console.error(error)
}

const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()

    if (error) console.error(error)
}

export { signIn, signOut, supabase }
