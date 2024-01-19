import { z } from "zod"

const IS_DEV = process.env.NODE_ENV !== "production"

const locales = ["en", "fr"] as const
const devLocales = [...locales, "pseudo-LOCALE"] as const
export type Locale = (typeof locales)[number] | (typeof devLocales)[number]

type I18nConfig = {
    locales: Locale[]
    defaultLocale: Locale
}

const i18nDevConfig: I18nConfig = {
    locales: [...devLocales],
    defaultLocale: "en",
}

const i18nProdConfig: I18nConfig = {
    locales: [...locales],
    defaultLocale: "en",
}

export const i18nConfig = IS_DEV ? i18nDevConfig : i18nProdConfig

export const localeSchema =
    process.env.NODE_ENV === "production"
        ? z.enum(locales).catch("en")
        : z.enum(devLocales).catch("en")
