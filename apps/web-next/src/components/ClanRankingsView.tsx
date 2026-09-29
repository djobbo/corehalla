import { EntityLink } from "./EntityLink"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PageNav } from "@/components/PageNav"
import { clanHref } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import { useId } from "react"
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
}) => {
    /*
     * `htmlFor`/`id` rather than a label wrapped around the control: shadcn's
     * `Input` is a component, so the `<input>` it renders is not visible to a
     * static checker reading this JSX — the association has to be explicit. The
     * id has to be unique in the document, which is what `useId` is for.
     */
    const searchId = useId()

    return (
        <div>
            <div className="flex flex-col gap-1 sm:max-w-sm">
                {/*
                 * The label wears `.ch-stat-label`, the same micro-label the
                 * migrated `SelectField` uses, so a text filter and a select
                 * read as the same kind of control.
                 */}
                <label htmlFor={searchId} className="ch-stat-label">
                    Search guilds
                </label>
                <Input
                    id={searchId}
                    type="search"
                    value={query}
                    placeholder="Guild name"
                    onChange={(event) => onQueryChange(event.target.value)}
                />
            </div>

            {rows.length === 0 ? (
                <Empty className="mt-4 bg-card py-8">
                    <EmptyHeader>
                        <EmptyDescription>
                            {resultQuery
                                ? `No guilds match “${resultQuery}”.`
                                : "No guilds have been indexed yet."}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="mt-4 overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {rankOffset === null ? null : (
                                    <TableHead className="w-7">#</TableHead>
                                )}
                                <TableHead>Guild</TableHead>
                                <TableHead className="w-28 text-right">
                                    Created
                                </TableHead>
                                <TableHead className="w-24 text-right">
                                    XP
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {rows.map((clan, index) => (
                                <TableRow key={clan.id}>
                                    {rankOffset === null ? null : (
                                        <TableCell>
                                            <span className="ch-rank">
                                                <span>
                                                    {rankOffset + index + 1}
                                                </span>
                                            </span>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <EntityLink
                                            type="clan"
                                            id={clan.id}
                                            href={clanHref(clan.slug)}
                                            className="font-semibold"
                                        >
                                            {cleanString(clan.name)}
                                        </EntityLink>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "text-right text-xs",
                                            clan.created && clan.created > 0
                                                ? "text-muted-foreground"
                                                : "text-muted-foreground/50",
                                        )}
                                    >
                                        {clan.created && clan.created > 0
                                            ? formatUnixTime(clan.created)
                                            : "—"}
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums">
                                        {clan.xp.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <PageNav prevHref={prevHref} nextHref={nextHref} />
        </div>
    )
}
