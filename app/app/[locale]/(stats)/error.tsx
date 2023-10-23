"use client"

import { ErrorDisplay } from "../_layout/ErrorDisplay"
import { msg } from "@lingui/macro"
import { useEffect } from "react"
import { useLingui } from "@lingui/react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const { _ } = useLingui()
    useEffect(() => {
        // TODO: Log the error to an error reporting service
        console.error(error)
    }, [error])

    return <ErrorDisplay reset={reset} title={_(msg`Failed to fetch stats`)} />
}
