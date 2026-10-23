import { Schema } from "effect"

/**
 * `updated_at` is the oldest upstream fetch behind the payload, not assembly
 * time. Epoch ms to match `QueuedEntry.queuedAt`.
 */
export const MetaSchema = Schema.Struct({
    updated_at: Schema.Number,
})

export type Meta = typeof MetaSchema.Type

/** id keys lists; slug builds links — do not re-derive either on the client. */
export const PlayerRefSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
})

export type PlayerRef = typeof PlayerRefSchema.Type

/** Null for Valhallan (top of ladder); both upstreams use null. */
export const TierSchema = Schema.NullOr(Schema.String)

export const envelope = <A extends Schema.Top>(data: A) =>
    Schema.Struct({
        data,
        meta: MetaSchema,
    })
