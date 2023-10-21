export const locales = ["en", "fr", "de", "ja"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

export const i18nConfig = {
    locales: [...locales],
    defaultLocale,
}
