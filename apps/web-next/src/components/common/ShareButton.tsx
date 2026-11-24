import { Check, Share2 } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/cn"
import {
    shareFailure,
    shareMode,
    shareUrl,
    type ShareFailure,
} from "@/lib/share"

export type ShareButtonProps = {
    readonly name: string
    readonly path: string
}

type ShareState = "idle" | ShareFailure | "shared" | "copied"

const CONFIRMATION_MS = 2400

const labels: Readonly<Record<ShareState, string>> = {
    idle: "Share",
    shared: "Shared",
    copied: "Link copied",
    cancelled: "Share",
    failed: "Copy failed",
}

const announcement = (state: ShareState, name: string): string => {
    switch (state) {
        case "shared":
            return `Shared ${name}'s profile.`
        case "copied":
            return `Link to ${name}'s profile copied to the clipboard.`
        case "cancelled":
            return "Share cancelled."
        case "failed":
            return `Could not copy the link to ${name}'s profile.`
        default:
            return ""
    }
}

export const ShareButton = ({ name, path }: ShareButtonProps) => {
    const [state, setState] = useState<ShareState>("idle")

    useEffect(() => {
        if (state === "idle") return

        const timer = setTimeout(() => setState("idle"), CONFIRMATION_MS)

        return () => clearTimeout(timer)
    }, [state])

    const share = async () => {
        const url = shareUrl(window.location.origin, path)

        if (shareMode(navigator) === "share") {
            try {
                await navigator.share({ title: name, url })
                setState("shared")

                return
            } catch (error) {
                const failure = shareFailure(error)

                if (failure === "cancelled") {
                    setState("cancelled")

                    return
                }
            }
        }

        try {
            await navigator.clipboard.writeText(url)
            setState("copied")
        } catch {
            setState("failed")
        }
    }

    const confirmed = state === "shared" || state === "copied"

    return (
        <>
            <button
                type="button"
                aria-label={`Share ${name}'s profile`}
                onClick={() => void share()}
                className={cn(
                    "ch-chip focus-visible:outline-2 focus-visible:outline-ring",
                    confirmed ? "ch-chip-on" : "ch-chip-off",
                )}
            >
                {confirmed ? (
                    <Check aria-hidden className="size-3.5" />
                ) : (
                    <Share2 aria-hidden className="size-3.5" />
                )}
                {labels[state]}
            </button>
            <output aria-live="polite" className="sr-only">
                {announcement(state, name)}
            </output>
        </>
    )
}
