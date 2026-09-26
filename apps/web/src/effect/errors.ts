import { Data } from "effect"

/**
 * Typed domain errors.
 *
 * `Effect.tryPromise` needs a typed `catch` to keep the error channel
 * meaningful; these tagged errors are what the services fail with before the
 * HTTP layer turns infrastructure failures into defects (HTTP 500).
 */

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
    readonly cause: unknown
}> {}

export class ContentError extends Data.TaggedError("ContentError")<{
    readonly cause: unknown
}> {}

export class AuthError extends Data.TaggedError("AuthError")<{
    readonly cause: unknown
}> {}
