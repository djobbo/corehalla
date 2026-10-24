import {
    CONTRACT_VERSION,
    SectionFailed,
    SectionRateLimited,
    SectionTimedOut,
} from "@crh/api-contract/schemas"
import type { PartStatus, SectionMeta } from "@crh/api-contract/schemas"
import type { V1Error } from "../upstream/v1"

export type PartEntry = {
    readonly status: PartStatus
    readonly updated_at: number
}

export type PartEntries = Readonly<Record<string, PartEntry>>

export const PLAN = {
    playerProfile: "player/profile@1",
    playerLegends: "player/legends@1",
    playerWeapons: "player/weapons@1",
    playerTeams: "player/teams@1",
    playerClan: "player/clan@1",
    playerEsports: "player/esports@1",
    guildProfile: "guild/profile@1",
    rankings1v1: "rankings/1v1@1",
    rankings2v2: "rankings/2v2@1",
    rankings3v3: "rankings/3v3@1",
    rankingsBoard: "rankings/board@1",
    powerRankings: "rankings/power@1",
} as const

export type PlanId = (typeof PLAN)[keyof typeof PLAN]

/** A definitive "no record" is a complete answer; an error is not. */
const isTerminal = (status: PartStatus): boolean =>
    status === "ok" || status === "not_found"

export const sectionMeta = (
    plan: PlanId | string,
    parts: PartEntries,
    now: number = Date.now(),
): SectionMeta => {
    const entries = Object.entries(parts)
    const timestamps = entries
        .filter(([, entry]) => isTerminal(entry.status))
        .map(([, entry]) => entry.updated_at)

    return {
        plan,
        contract: CONTRACT_VERSION,
        updated_at: timestamps.length === 0 ? now : Math.min(...timestamps),
        complete: entries.every(([, entry]) => isTerminal(entry.status)),
        parts: Object.fromEntries(
            entries.map(([key, entry]) => [key, entry.status]),
        ),
    }
}

export const statusFromError = (error: V1Error): PartStatus => {
    switch (error._tag) {
        case "V1NotFound":
            return "not_found"
        case "V1Incomplete":
            return "incomplete"
        case "V1Unavailable":
            return error.reason === "rate_limited"
                ? "rate_limited"
                : error.reason === "timeout"
                  ? "timeout"
                  : error.reason === "transport"
                    ? "transport"
                    : "status"
    }
}

export const partFromResult = <A>(
    result:
        | { readonly _tag: "Success"; readonly success: A }
        | { readonly _tag: "Failure"; readonly failure: V1Error },
    updatedAt: number,
): PartEntry =>
    result._tag === "Success"
        ? { status: "ok", updated_at: updatedAt }
        : { status: statusFromError(result.failure), updated_at: updatedAt }

/** Maps the first missing required source to the HTTP error the client patches on. */
export const toSectionError = (plan: PlanId | string, parts: PartEntries) => {
    const statuses = Object.values(parts).map((entry) => entry.status)
    const payload = {
        plan,
        contract: CONTRACT_VERSION,
        parts: Object.fromEntries(
            Object.entries(parts).map(([key, entry]) => [key, entry.status]),
        ),
    }

    if (statuses.includes("rate_limited")) {
        return new SectionRateLimited(payload)
    }

    if (statuses.includes("timeout")) {
        return new SectionTimedOut(payload)
    }

    return new SectionFailed(payload)
}
