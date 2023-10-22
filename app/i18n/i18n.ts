import { type I18n, setupI18n } from "@lingui/core"
import { type Locale, localeSchema } from "./i18nConfig"
import { cache } from "react"
import { logError } from "logger"

const getLocaleCtx = cache((): { current: I18n | undefined } => {
    return { current: undefined }
})

export const setI18n = (locale: I18n) => {
    getLocaleCtx().current = locale
}

export const getI18n = (): I18n | undefined => {
    return getLocaleCtx().current
}

const loadCatalog = async (locale: string) => {
    try {
        const catalog = await import(`@lingui/loader!./locales/${locale}.po`)
        return catalog.messages
    } catch (e) {
        logError(`No catalog for locale "${locale}"`)
        return {}
    }
}

export type I18nSetupData = {
    locale: Locale
    messages: Partial<Record<Locale, Record<string, string>>>
}

export const initServerTranslations = async (params: { locale: string }) => {
    const locale = localeSchema.parse(params.locale)
    const catalog = await loadCatalog(locale)

    const i18nSetupData: I18nSetupData = {
        locale,
        messages: { [locale]: catalog },
    }

    const i18n = setupI18n(i18nSetupData)

    setI18n(i18n)

    return i18nSetupData
}
