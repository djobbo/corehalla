import { EntityLink } from "./EntityLink"
import { PageNav } from "@/components/ui/PageNav"
import { clanHref } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { ClansSchema } from "@crh/api-contract/schemas"

/**
 * One row of the clan leaderboard.
 *
 * Taken from the contract rather than restated, and imported as a *type* so the
 * schema's runtime half never reaches the browser. The client does not depend on
 * `@crh/db`, so its Drizzle row type is not reachable from here — `ClansSchema`
 * is the same shape, published by the package that owns the wire format.
 */
type ClanRow = (typeof ClansSchema.Type)[number]

/**
 * The clan leaderboard: search over a paged list of clans, ordered by XP.
 *
 * `q` decides two things beyond which rows come back, and both follow from the
 * same fact — a name-filtered list is not a ranking. The archive returns a
 * prefix match ordered by XP *within that match*, so numbering the rows would
 * claim a global position that the query never computed. The rank column is
 * therefore dropped while a query is active rather than showing a number that
 * looks like a place in the ladder and is not one.
 *
 * XP is the one figure every clan has. `created` is nullable in the archive —
 * a clan crawled before the field was captured has no date — so an absent one
 * renders as a dash instead of the epoch or a blank.
 */
export const ClanRankingsView = ({
    rows,
    query,
    onQueryChange,
    resultQuery,
    rankOffset,
    prevHref,
    nextHref,
}: {
    readonly rows: readonly ClanRow[]
    /** What is in the input, which is allowed to run ahead of the request. */
    readonly query: string
    readonly onQueryChange: (value: string) => void
    /**
     * The query the rows were actually fetched for.
     *
     * Separate from `query` because the input is debounced: for a few hundred
     * milliseconds the two disagree, and only this one describes the list on
     * screen. An empty-state message built from the typed value would name a
     * search that has not run yet.
     */
    readonly resultQuery: string
    /** Added to each row's position to give its rank, or `null` to hide ranks. */
    readonly rankOffset: number | null
    readonly prevHref?: string | undefined
    readonly nextHref?: string | undefined
}) => (
    <div>
        <label className="flex flex-col gap-1 sm:max-w-sm">
            <span className="ch-stat-label">Search clans</span>
            <input
                type="search"
                className="ch-input"
                value={query}
                placeholder="Clan name"
                onChange={(event) => onQueryChange(event.target.value)}
            />
        </label>

        {rows.length === 0 ? (
            <p className="ch-panel mt-4 px-4 py-8 text-center text-sm text-textVar1">
                {resultQuery
                    ? `No clans match “${resultQuery}”.`
                    : "No clans have been indexed yet."}
            </p>
        ) : (
            <div className="ch-panel mt-4 overflow-hidden">
                <div className="ch-table-head">
                    {rankOffset === null ? null : (
                        <span className="w-7 shrink-0">#</span>
                    )}
                    <span className="flex-1">Clan</span>
                    <span className="w-28 shrink-0 text-right">Created</span>
                    <span className="w-24 shrink-0 text-right">XP</span>
                </div>

                {rows.map((clan, index) => (
                    <div key={clan.id} className="ch-row">
                        {rankOffset === null ? null : (
                            <span className="ch-rank">
                                <span>{rankOffset + index + 1}</span>
                            </span>
                        )}
                        <span className="flex min-w-0 flex-1">
                            <EntityLink
                                type="clan"
                                id={clan.id}
                                href={clanHref(clan.id)}
                                className="ch-link font-semibold"
                            >
                                {cleanString(clan.name)}
                            </EntityLink>
                        </span>
                        <span
                            className={cn(
                                "w-28 shrink-0 text-right text-xs",
                                clan.created && clan.created > 0
                                    ? "text-textVar1"
                                    : "text-textVar1/50",
                            )}
                        >
                            {clan.created && clan.created > 0
                                ? formatUnixTime(clan.created)
                                : "—"}
                        </span>
                        <span className="ch-rating w-24 shrink-0 text-right">
                            {clan.xp.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        )}

        <PageNav prevHref={prevHref} nextHref={nextHref} />
    </div>
)
