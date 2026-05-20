/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_GA_TRACKING_ID?: string
    readonly VITE_ADSENSE_ID?: string
    readonly VITE_ALERT?: string
    readonly VITE_API_URL?: string
    readonly VITE_FORCE_PRODUCTION_WEBSITE?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
