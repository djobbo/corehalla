import { Schema } from "effect"

/**
 * Bumped whenever a wire shape changes. The API stamps it on every response
 * (`x-corehalla-contract`) and in every section body so the client can ignore a
 * payload built by an incompatible deploy.
 */
export const CONTRACT_VERSION = 1

/** Build id is stamped on every response for the "reload to update" prompt. */
export const BUILD_ID: string =
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
        .env?.VITE_BUILD_ID ?? "dev"

/** Why a source inside a section is missing. Coarse on purpose — never raw upstream errors. */
export const PartStatusSchema = Schema.Literals([
    "ok",
    "not_found",
    "transport",
    "status",
    "rate_limited",
    "timeout",
    "incomplete",
    "server_only",
])

export type PartStatus = typeof PartStatusSchema.Type

export const SectionMetaSchema = Schema.Struct({
    /** e.g. `player/profile@1` — the plan that produced this section. */
    plan: Schema.String,
    contract: Schema.Number,
    /** Oldest source behind the section, epoch ms. */
    updated_at: Schema.Number,
    /** False when at least one non-definitive source is missing. */
    complete: Schema.Boolean,
    parts: Schema.Record(Schema.String, PartStatusSchema),
})

export type SectionMeta = typeof SectionMetaSchema.Type

export const sectionEnvelope = <A extends Schema.Top>(data: A) =>
    Schema.Struct({
        data,
        meta: SectionMetaSchema,
    })

/** A section rendered with a missing optional source: usable, but not whole. */
export const SectionUnavailableReason = Schema.Literals([
    "upstream",
    "rate_limited",
    "timeout",
    "no_binding",
])

export type SectionUnavailableReason = typeof SectionUnavailableReason.Type

const SectionErrorFields = {
    plan: Schema.String,
    contract: Schema.Number,
    parts: Schema.Record(Schema.String, PartStatusSchema),
}

export class SectionFailed extends Schema.Error<SectionFailed>("SectionFailed")(
    {
        _tag: Schema.tag("SectionFailed"),
        ...SectionErrorFields,
    },
    {
        description: "A required upstream source failed",
        httpApiStatus: 502,
    },
) {}

export class SectionRateLimited extends Schema.Error<SectionRateLimited>(
    "SectionRateLimited",
)(
    {
        _tag: Schema.tag("SectionRateLimited"),
        ...SectionErrorFields,
    },
    {
        description: "The API cannot reach upstream (budget or binding)",
        httpApiStatus: 503,
    },
) {}

export class SectionTimedOut extends Schema.Error<SectionTimedOut>(
    "SectionTimedOut",
)(
    {
        _tag: Schema.tag("SectionTimedOut"),
        ...SectionErrorFields,
    },
    {
        description: "The section exceeded its server deadline",
        httpApiStatus: 504,
    },
) {}

export const SectionErrorSchema = Schema.Union([
    SectionFailed,
    SectionRateLimited,
    SectionTimedOut,
])

export type SectionError = SectionFailed | SectionRateLimited | SectionTimedOut
