import { Data } from "effect"

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
    readonly cause: unknown
}> {}

export class ContentError extends Data.TaggedError("ContentError")<{
    readonly cause: unknown
}> {}
