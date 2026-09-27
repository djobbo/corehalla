import { Data } from "effect"

/**
 * The auth surface's only domain error.
 *
 * A session lookup, a favourite write or a Discord token refresh that fails is
 * an infrastructure failure, not a client mistake: the handlers answer a
 * *missing* session with an explicit 401 and let this one reach the API's error
 * handler as a 500.
 */
export class AuthError extends Data.TaggedError("AuthError")<{
    readonly cause: unknown
}> {}
