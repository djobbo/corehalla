import { type Locale, defaultLocale, locales } from "./i18nConfig"
import { type ResourceLanguage, createInstance } from "i18next"
import { initReactI18next } from "react-i18next/initReactI18next"
import { z } from "zod"
import resourcesToBackend from "i18next-resources-to-backend"

const localeSchema = z.enum(locales).catch(defaultLocale)

export const initServerTranslations = async (params: { locale: string }) => {
    const locale = localeSchema.parse(params.locale)
    const i18nInstance = await initTranslations(locale)

    return i18nInstance
}

const namespaces = ["translation"] as const

const en = {
    translation: {
        "hello world": "Hello World",
        "View rankings": "View rankings",
    },
} satisfies ResourceLanguage

export const initTranslations = async (locale: Locale) => {
    const i18nInstance = createInstance()

    await i18nInstance
        .use(initReactI18next)
        .use(
            resourcesToBackend({
                en,
                fr: {
                    translation: {
                        "hello world": "Bonjour le monde",
                        "View rankings": "Voir le classement",
                    },
                },
            }),
        )
        .init({
            lng: locale,
            fallbackLng: defaultLocale,
            supportedLngs: locales,
            defaultNS: namespaces[0],
            fallbackNS: namespaces[0],
            ns: namespaces,
            preload: typeof window === "undefined" ? locales : [],
        })

    return i18nInstance
}
