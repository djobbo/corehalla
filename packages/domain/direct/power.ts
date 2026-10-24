import { Effect } from "effect"
import { buildPowerRankings } from "../power-rankings"
import { PLAN, toSectionError } from "../sections/meta"
import type { BrawltoolsShape } from "../brawltools"
import type { PowerRankingsInput } from "../power-rankings"
import type { PowerRankingsEnvelope } from "@crh/api-contract/schemas"

export const directPowerRankings = (
    brawltools: BrawltoolsShape,
    input: PowerRankingsInput,
): Effect.Effect<PowerRankingsEnvelope, ReturnType<typeof toSectionError>> =>
    buildPowerRankings(brawltools, input).pipe(
        Effect.map((page) => ({
            data: page.players,
            meta: {
                updated_at: Date.now(),
                total_pages: page.totalPages,
            },
        })),
        Effect.mapError(() =>
            toSectionError(PLAN.powerRankings, {
                brawltools: { status: "status", updated_at: Date.now() },
            }),
        ),
    )
