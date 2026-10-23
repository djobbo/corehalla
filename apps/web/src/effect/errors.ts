import { Data } from "effect"

/**
 * Typed domain errors for the Start app.
 *
 * Only auth remains here: the ranking/alias services moved to the API worker
 * with their own error module (`apps/api/src/errors.ts`).
 */

export class AuthError extends Data.TaggedError("AuthError")<{
    readonly cause: unknown
}> {}
