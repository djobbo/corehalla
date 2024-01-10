"use client"

import { ErrorDisplay } from "./_layout/ErrorDisplay"
import { msg } from "@lingui/macro"
import { useLingui } from "@lingui/react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const { _ } = useLingui()

    return (
        <ErrorDisplay
            reset={reset}
            title={_(msg`An unknown error occured :(`)}
            error={error}
        />
    )
}
