export type ShareCapability = {
    readonly share?: unknown
}

export type ShareMode = "share" | "copy"

/**
 * `navigator.share` is missing from most desktop browsers, and a duck-typed
 * function test keeps the decision free of a `Navigator` and a DOM.
 */
export const shareMode = (capability: ShareCapability): ShareMode =>
    typeof capability.share === "function" ? "share" : "copy"

/** The absolute URL for a profile path, joined with exactly one slash. */
export const shareUrl = (origin: string, path: string): string =>
    `${origin.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`

export type ShareFailure = "cancelled" | "failed"

const isAbortError = (error: unknown): boolean =>
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"

/** A dismissed share sheet is the user's choice, not a failure to report. */
export const shareFailure = (error: unknown): ShareFailure =>
    isAbortError(error) ? "cancelled" : "failed"
