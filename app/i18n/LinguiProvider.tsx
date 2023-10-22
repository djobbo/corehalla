"use client"

import { I18nProvider } from "@lingui/react"
import { type I18nSetupData } from "./i18n"
import { type ReactNode } from "react"
import { setupI18n } from "@lingui/core"

type LinguiProviderProps = I18nSetupData & {
    children: ReactNode
}

export function LinguiProvider({
    children,
    messages,
    locale,
}: LinguiProviderProps) {
    return (
        <I18nProvider
            i18n={setupI18n({
                messages,
                locale,
            })}
        >
            {children}
        </I18nProvider>
    )
}
