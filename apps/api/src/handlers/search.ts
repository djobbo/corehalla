import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"
import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Database } from "@crh/core/services/archive"
import { Lookup } from "@crh/core/services/lookup"

export const searchGroup = HttpApiBuilder.group(
    CorehallaApi,
    "search",
    Effect.fnUntraced(function* (handlers) {
        const db = yield* Database
        const lookup = yield* Lookup

        return (
            handlers
                .handle("searchPlayerAlias", ({ query }) =>
                    db.searchAliases(query.alias, query.page).pipe(
                        Effect.orDie,
                        Effect.map((rows) =>
                            rows.map((row) => ({
                                ...row,
                                slug: getEntitySlug(
                                    row.playerId,
                                    row.mainAlias,
                                ),
                            })),
                        ),
                    ),
                )
                // Federated: each source degrades to empty — partial beats error on jump-to.
                .handle("lookup", ({ query }) =>
                    lookup.search(query.q, query.limit, query.region).pipe(
                        Effect.map((rows) =>
                            rows.map((row) => ({
                                ...row,
                                slug: getEntitySlug(row.id, row.name),
                            })),
                        ),
                    ),
                )
        )
    }),
)
