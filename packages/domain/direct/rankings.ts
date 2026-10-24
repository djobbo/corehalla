import { Effect } from "effect"
import {
    buildRankings1v1,
    buildRankings2v2,
    buildRankings3v3,
} from "../aggregate/rankings"
import { PLAN, statusFromError, toSectionError } from "../sections/meta"
import type { V1UpstreamShape } from "../upstream/client"
import type { V1Error } from "../upstream/v1"
import type {
    Rankings1v1Envelope,
    Rankings2v2Envelope,
    Rankings3v3Envelope,
    RankedRegion,
} from "@crh/api-contract/schemas"

const fail = (plan: string, error: V1Error) =>
    toSectionError(plan, {
        board: { status: statusFromError(error), updated_at: Date.now() },
    })

const EMPTY_BEST_LEGENDS = new Map<string, never>()

export const directRankings1v1 = (
    upstream: V1UpstreamShape,
    region: typeof RankedRegion.Type,
    page: number,
    name?: string,
): Effect.Effect<Rankings1v1Envelope, ReturnType<typeof fail>> =>
    upstream.getRankings("1v1", region, page, name).pipe(
        // The archive's best-legend rows are DB-only; v1's own field has been
        // zero since it was dropped, so the fallback renders unlinked legends.
        Effect.map((rows) =>
            buildRankings1v1(
                rows as Parameters<typeof buildRankings1v1>[0],
                EMPTY_BEST_LEGENDS,
                Date.now(),
            ),
        ),
        Effect.mapError((error) => fail(PLAN.rankings1v1, error)),
    )

export const directRankings2v2 = (
    upstream: V1UpstreamShape,
    region: typeof RankedRegion.Type,
    page: number,
): Effect.Effect<Rankings2v2Envelope, ReturnType<typeof fail>> =>
    upstream.getRankings("2v2", region, page).pipe(
        Effect.map((rows) =>
            buildRankings2v2(
                rows as Parameters<typeof buildRankings2v2>[0],
                Date.now(),
            ),
        ),
        Effect.mapError((error) => fail(PLAN.rankings2v2, error)),
    )

export const directRankings3v3 = (
    upstream: V1UpstreamShape,
    region: typeof RankedRegion.Type,
    page: number,
): Effect.Effect<Rankings3v3Envelope, ReturnType<typeof fail>> =>
    upstream.getRankings("3v3", region, page).pipe(
        Effect.map((rows) =>
            buildRankings3v3(
                rows as Parameters<typeof buildRankings3v3>[0],
                Date.now(),
            ),
        ),
        Effect.mapError((error) => fail(PLAN.rankings3v3, error)),
    )
