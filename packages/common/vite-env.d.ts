interface ImportMetaEnv {
    readonly VITE_GA_TRACKING_ID?: string
    readonly VITE_ADSENSE_ID?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
