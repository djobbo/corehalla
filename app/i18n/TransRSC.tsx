import React from "react"

import { TransNoContext, type TransProps } from "@lingui/react/server"
import { getI18n } from "./i18n"

export const Trans = (props: TransProps) => {
    const i18n = getI18n()

    if (!i18n) {
        throw new Error(
            "Lingui for RSC is not initialized. Use `setI18n()` first in root of your RSC tree.",
        )
    }

    return <TransNoContext {...props} lingui={{ i18n }} />
}
