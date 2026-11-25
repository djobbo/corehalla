import { Link, useNavigate } from "@tanstack/react-router"
import { useId, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/cn"
import { compareLegends, legendCompareSample } from "@/lib/legendCompare"
import { legendHref, legendSlug } from "@/lib/legends"
import { LegendIcon } from "@/components/legend/LegendIcon"
import { VersusModeSwitch } from "./VersusModeSwitch"
import { legends } from "@crh/bhapi/legends"
import type { LegendCompareRow } from "@/lib/legendCompare"
import type { LegendMeta } from "@crh/api-contract/schemas"
import type { Legend } from "@crh/bhapi/types"

const MATCH_LIMIT = 6

const matchesLegend = (legend: Legend, needle: string): boolean =>
    legend.bio_name.toLowerCase().includes(needle) ||
    legend.bio_aka.toLowerCase().includes(needle)

const LegendField = ({
    label,
    placeholder,
    selected,
    onPick,
}: {
    readonly label: string
    readonly placeholder: string
    readonly selected: Legend | null
    readonly onPick: (legend: Legend) => void
}) => {
    const id = useId()
    const [query, setQuery] = useState(selected?.bio_name ?? "")
    const [listing, setListing] = useState(false)
    const needle = query.trim().toLowerCase()
    const matches =
        !listing || needle === ""
            ? []
            : legends
                  .filter((legend) => matchesLegend(legend, needle))
                  .slice(0, MATCH_LIMIT)

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-[0.64rem] font-bold tracking-[0.18em] text-muted-foreground uppercase"
            >
                {label}
            </label>
            <Input
                id={id}
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value)
                    setListing(true)
                }}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck={false}
            />
            {listing && needle !== "" && matches.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    No legends match “{query.trim()}”.
                </p>
            ) : null}
            {matches.length === 0 ? null : (
                <ul className="divide-y divide-border border border-border bg-card">
                    {matches.map((legend) => (
                        <li key={legend.legend_id}>
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery(legend.bio_name)
                                    setListing(false)
                                    onPick(legend)
                                }}
                                className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-bgVar2"
                            >
                                <LegendIcon
                                    legend={legend}
                                    className="size-7 shrink-0 object-contain"
                                />
                                <span className="flex min-w-0 flex-col">
                                    <span className="truncate font-semibold">
                                        {legend.bio_name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {legend.weapon_one} ·{" "}
                                        {legend.weapon_two}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

const SideCell = ({
    side,
    legend,
    row,
}: {
    readonly side: "a" | "b"
    readonly legend: Legend
    readonly row: LegendCompareRow
}) => {
    const better = row.winner === side

    return (
        <td
            data-better={better ? "true" : undefined}
            className={cn(
                "flex min-w-0 items-baseline justify-between gap-3 px-3 py-1 whitespace-normal break-words sm:table-cell sm:py-2 sm:text-right",
                better ? "text-foreground" : "text-muted-foreground",
            )}
        >
            <Link
                to={legendHref(legend)}
                className="ch-stat-label hover:text-foreground sm:hidden"
            >
                {legend.bio_name}
            </Link>
            <span className={cn("tabular-nums", better && "font-bold")}>
                {side === "a" ? row.a : row.b}
            </span>
            {better ? <span className="sr-only"> (better)</span> : null}
        </td>
    )
}

const headCell =
    "bg-bgVar2 px-3 py-1.5 align-middle text-[0.6rem] font-extrabold tracking-[0.16em] whitespace-nowrap text-muted-foreground uppercase"

const CompareTable = ({
    a,
    b,
    meta,
}: {
    readonly a: Legend
    readonly b: Legend
    readonly meta: LegendMeta | null
}) => {
    const rows = compareLegends(a, b, meta?.data ?? [])

    return (
        <section aria-labelledby="legend-compare-title" className="mt-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <p className="ch-kicker">Indexed play style</p>
                    <h2
                        id="legend-compare-title"
                        className="ch-display mt-1 text-lg"
                    >
                        Side by side
                    </h2>
                    <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                        {meta === null
                            ? "Meta metrics are unavailable right now; the attributes still compare."
                            : legendCompareSample(meta.meta.accounts)}
                    </p>
                    <Link
                        to="/legends"
                        className="ch-kicker mt-1 inline-flex hover:text-foreground"
                    >
                        Full legend board <span aria-hidden>&rarr;</span>
                    </Link>
                </div>
            </div>

            <Card className="mt-3 overflow-hidden py-0">
                <table className="w-full table-fixed text-sm">
                    <caption className="sr-only">
                        {a.bio_name} compared with {b.bio_name}
                    </caption>
                    <thead className="hidden sm:table-header-group">
                        <tr className="border-b border-border">
                            <th
                                scope="col"
                                className={cn(headCell, "w-36 text-left")}
                            >
                                Metric
                            </th>
                            <th
                                scope="col"
                                className={cn(headCell, "text-right")}
                            >
                                <Link
                                    to={legendHref(a)}
                                    className="hover:text-foreground"
                                >
                                    {a.bio_name}
                                </Link>
                            </th>
                            <th
                                scope="col"
                                className={cn(headCell, "text-right")}
                            >
                                <Link
                                    to={legendHref(b)}
                                    className="hover:text-foreground"
                                >
                                    {b.bio_name}
                                </Link>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.label}
                                className="block border-b border-border last:border-0 sm:table-row"
                            >
                                <th
                                    scope="row"
                                    className="block px-3 pt-2 text-left align-middle text-xs font-normal text-muted-foreground sm:table-cell sm:py-2"
                                >
                                    {row.label}
                                </th>
                                <SideCell side="a" legend={a} row={row} />
                                <SideCell side="b" legend={b} row={row} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </section>
    )
}

export type LegendVersusViewProps = {
    readonly a: Legend | null
    readonly b: Legend | null
    readonly meta: LegendMeta | null
}

export const LegendVersusView = ({ a, b, meta }: LegendVersusViewProps) => {
    const navigate = useNavigate()
    const aSlug = a === null ? undefined : legendSlug(a)
    const bSlug = b === null ? undefined : legendSlug(b)
    const both = a !== null && b !== null

    const pick = (side: "a" | "b", legend: Legend): void => {
        const nextA = side === "a" ? legendSlug(legend) : aSlug
        const nextB = side === "b" ? legendSlug(legend) : bSlug

        void navigate({
            to: "/vs",
            search: { type: "legends", a: nextA, b: nextB },
        })
    }

    return (
        <div>
            <header className="ch-hero mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="ch-kicker">Head to head</p>
                    <h1 className="ch-display mt-1 text-2xl">
                        {both
                            ? `${a.bio_name} vs ${b.bio_name}`
                            : "Compare legends"}
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Attributes and indexed play style, side by side.
                    </p>
                </div>
                <VersusModeSwitch mode="legends" />
            </header>

            <Card className="p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <LegendField
                        key={`a-${aSlug ?? "none"}`}
                        label="Legend one"
                        placeholder="Search a legend…"
                        selected={a}
                        onPick={(legend) => pick("a", legend)}
                    />
                    <LegendField
                        key={`b-${bSlug ?? "none"}`}
                        label="Legend two"
                        placeholder="Search a legend…"
                        selected={b}
                        onPick={(legend) => pick("b", legend)}
                    />
                </div>
            </Card>

            {both ? (
                <CompareTable a={a} b={b} meta={meta} />
            ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                    Pick{" "}
                    {a === null && b === null
                        ? "two legends"
                        : "a second legend"}{" "}
                    to see the comparison.
                </p>
            )}
        </div>
    )
}
