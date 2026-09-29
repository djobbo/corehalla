import { Schema } from "effect"

/**
 * The shape every aggregated response shares.
 *
 * `kubi` wraps each page payload in `{ data, meta }`, and the envelope is the
 * part worth copying exactly: it gives a response one place to say "when was
 * this" without every entity having to carry its own timestamp, and it leaves
 * room to add pagination or a cache verdict later without moving the payload.
 *
 * `updated_at` is the fetch time of the **oldest** upstream read behind the
 * payload, not the moment the response was assembled. An aggregate is composed
 * from several independently-cached reads — career stats, ranked, 3v3, the clan
 * — and stamping it with `now` would claim the whole page is as fresh as its
 * newest part. Reporting the minimum is the honest answer and the one a caller
 * can act on: it is how long ago the least-current fact on the page was true.
 *
 * Epoch milliseconds rather than a `Date`. The aggregated endpoints mix sources
 * that do not share a clock — an upstream payload, our own archive, and the
 * moment of assembly — and milliseconds is the unit the archive already speaks
 * (`QueuedEntry.queuedAt`), so nothing has to guess how a date was serialized.
 */
export const MetaSchema = Schema.Struct({
    updated_at: Schema.Number,
})

export type Meta = typeof MetaSchema.Type

/**
 * A reference to a player, as a link.
 *
 * `slug` is the canonical URL segment (`1234-name`); `id` is what the API is
 * actually keyed by. Both travel, because a client needs the id to key a list
 * and the slug to build a link, and re-deriving either one from the other on
 * the client would mean shipping `sluggify` to the browser for every entity.
 */
export const PlayerRefSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
})

export type PlayerRef = typeof PlayerRefSchema.Type

/**
 * A ranked tier.
 *
 * Nullable because both upstreams use null for the top of the ladder
 * ("Valhallan"), and inventing a string on the server would make the payload
 * disagree with the row the client already handles. The renderer decides what a
 * null tier looks like.
 */
export const TierSchema = Schema.NullOr(Schema.String)

/** Wraps a payload schema in the `{ data, meta }` envelope. */
export const envelope = <A extends Schema.Top>(data: A) =>
    Schema.Struct({
        data,
        meta: MetaSchema,
    })
