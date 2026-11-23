import { Cause, Option } from "effect"

/**
 * A real 404 is the route's own answer; only an upstream failure may degrade to
 * the browser's fallback pass.
 */
export const isNotFound = (error: unknown): boolean => {
    if ((error as { _tag?: string } | null)?._tag === "NotFound") return true

    const cause = (error as { cause?: Cause.Cause<unknown> } | null)?.cause

    if (cause === undefined) return false

    return Option.match(Cause.findErrorOption(cause), {
        onNone: () => false,
        onSome: (failure) => (failure as { _tag?: string })._tag === "NotFound",
    })
}
