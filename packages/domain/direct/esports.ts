import { Effect } from "effect"
import { buildPlayerEsports } from "../esports"
import { PLAN, toSectionError } from "../sections/meta"
import type { BrawltoolsShape } from "../brawltools"
import type { PlayerEsportsEnvelope } from "@crh/api-contract/schemas"

export const directPlayerEsports = (
    brawltools: BrawltoolsShape,
    playerId: number,
): Effect.Effect<PlayerEsportsEnvelope, ReturnType<typeof toSectionError>> =>
    buildPlayerEsports(brawltools, playerId).pipe(
        Effect.map((data) => ({
            data,
            meta: { updated_at: Date.now() },
        })),
        Effect.mapError(() =>
            toSectionError(PLAN.playerEsports, {
                brawltools: { status: "status", updated_at: Date.now() },
            }),
        ),
    )
