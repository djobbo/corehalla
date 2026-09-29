import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Database } from "@crh/core/services/archive"
import { Lookup } from "@crh/core/services/lookup"

/**
 * The two search surfaces.
 *
 * Both add the one field the data layer deliberately leaves out — the URL
 * segment — because that is a transport concern and the archive and the
 * federated lookup have no business knowing what a profile URL looks like.
 */
export const searchGroup = HttpApiBuilder.group(
    CorehallaApi,
    "search",
    Effect.fnUntraced(function* (handlers) {
        const db = yield* Database
        const lookup = yield* Lookup

        return (
            handlers
                // The raw local alias index, kept for the existing search
                // surface.
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
                // The federated lookup. Never fails: each source degrades to
                // "no results", because a partial answer beats an error on a
                // jump-to-result interaction.
                .handle("lookup", ({ query }) =>
                    lookup.search(query.q, query.limit).pipe(
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
