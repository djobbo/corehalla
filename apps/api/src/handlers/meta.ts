import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"
import { CorehallaApi } from "@crh/api-contract/Api"
import { legendMetaFloorRating } from "@crh/api-contract/schemas"
import { Database } from "@crh/core/services/archive"
import { buildLegendMeta } from "@crh/domain/aggregate/meta"
import { PLAN, toSectionError } from "@crh/domain/sections/meta"

const LEGEND_META_TIMEOUT = "5000 millis"

export const metaGroup = HttpApiBuilder.group(
    CorehallaApi,
    "meta",
    Effect.fnUntraced(function* (handlers) {
        const db = yield* Database

        return handlers.handle("getLegendMeta", ({ query }) =>
            db.getLegendMeta(legendMetaFloorRating(query.floor)).pipe(
                Effect.map((sample) =>
                    buildLegendMeta(sample.rows, {
                        accounts: sample.accounts,
                        floor: query.floor,
                    }),
                ),
                Effect.mapError(() =>
                    toSectionError(PLAN.legendMeta, {
                        archive: {
                            status: "status",
                            updated_at: Date.now(),
                        },
                    }),
                ),
                Effect.timeoutOrElse({
                    duration: LEGEND_META_TIMEOUT,
                    orElse: () =>
                        Effect.fail(
                            toSectionError(PLAN.legendMeta, {
                                archive: {
                                    status: "timeout",
                                    updated_at: Date.now(),
                                },
                            }),
                        ),
                }),
            ),
        )
    }),
)
