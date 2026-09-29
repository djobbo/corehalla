import { Data } from "effect"

/** Infrastructure failure. A missing session is a 401, not this error. */
export class AuthError extends Data.TaggedError("AuthError")<{
    readonly cause: unknown
}> {}
