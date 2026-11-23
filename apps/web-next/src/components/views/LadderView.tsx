import { Link, useNavigate } from "@tanstack/react-router"
import { LadderTable } from "@/components/common/LadderTable"
import { PageNav } from "@/components/common/PageNav"
import { UpdatedAt } from "@/components/common/UpdatedAt"
import { Input } from "@/components/ui/input"
import { brackets, ladderHref, regionLabel, regions } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import type { LadderRow } from "@/lib/ladderRows"
import type { Bracket } from "@/lib/rankings"
import type { RankedRegion } from "@crh/api-contract/schemas"
import { useEffect, useRef, useState } from "react"

type Region = typeof RankedRegion.Type

/** Long enough to skip a burst of keystrokes, short enough to feel live. */
const FILTER_DEBOUNCE_MS = 250

/**
 * The 1v1 name filter.
 *
 * The value is URL state, but the input has to feel immediate, so it keeps a
 * local draft and pushes it up once typing settles. A value that arrives from
 * outside (back/forward, a shared link) resets the draft unless the draft is
 * what produced it.
 */
const PlayerFilter = ({
    value,
    onChange,
}: {
    readonly value: string
    readonly onChange: (next: string) => void
}) => {
    const [draft, setDraft] = useState(value)
    const committed = useRef(value)

    useEffect(() => {
        if (value === committed.current) return

        committed.current = value
        setDraft(value)
    }, [value])

    useEffect(() => {
        const next = draft.trim()
        if (next === value) return

        const timer = setTimeout(() => {
            committed.current = next
            onChange(next)
        }, FILTER_DEBOUNCE_MS)

        return () => clearTimeout(timer)
    }, [draft, value, onChange])

    return (
        <div className="mt-1.5">
            <Input
                type="search"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Filter by player name…"
                aria-label="Filter players by name"
                className="h-8 max-w-sm text-xs"
            />
        </div>
    )
}

export type LadderViewProps = {
    readonly bracket: Bracket
    readonly region: Region
    readonly page: number
    readonly rows: readonly LadderRow[]
    readonly hasNextPage: boolean
    readonly updatedAt: number
    /** The 1v1 name filter's URL value; other boards never set it. */
    readonly player?: string | undefined
}

export const LadderView = ({
    bracket,
    region,
    page,
    rows,
    hasNextPage,
    updatedAt,
    player = "",
}: LadderViewProps) => {
    const navigate = useNavigate()
    const filtered = player !== ""

    /**
     * Keep the filter, drop the page: a new query changes what every page
     * holds, so the first page is the only one that means anything.
     */
    const changePlayer = (next: string) => {
        void navigate({
            to: "/rankings/live/1v1/{-$region}/{-$page}",
            // Global has no segment of its own, and page 1 has no segment
            // either: a filtered board has one canonical URL.
            params: {
                region: region === "all" ? undefined : region,
                page: undefined,
            },
            search: { player: next === "" ? undefined : next },
            replace: true,
        })
    }

    return (
        <div>
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Live ladder</p>
                <h1 className="ch-display mt-1 text-2xl">{bracket} rankings</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                    {regionLabel(region)} · page {page}
                </p>
                <UpdatedAt at={updatedAt} className="block" />
            </header>
            <div className="sticky top-[var(--ch-header-h)] z-20 -mx-4 bg-background/95 px-4 py-2 shadow-[0_3px_0_0_var(--color-ink)] backdrop-blur">
                <nav aria-label="Bracket" className="flex flex-wrap gap-1.5">
                    {brackets.map((option) => (
                        <Link
                            key={option}
                            to={ladderHref(option, region, page)}
                            className={cn(
                                "ch-chip",
                                option === bracket
                                    ? "ch-chip-on"
                                    : "ch-chip-off",
                            )}
                        >
                            {option}
                        </Link>
                    ))}
                </nav>
                <nav
                    aria-label="Region"
                    className="mt-1.5 flex flex-wrap gap-1.5"
                >
                    {regions.map((option) => (
                        <Link
                            key={option.value}
                            to={ladderHref(bracket, option.value, 1)}
                            className={cn(
                                "ch-chip px-2.5 text-[0.62rem] tracking-[0.12em]",
                                option.value === region
                                    ? "ch-chip-on"
                                    : "ch-chip-off",
                            )}
                        >
                            {option.label}
                        </Link>
                    ))}
                </nav>
                {bracket === "1v1" && (
                    <PlayerFilter value={player} onChange={changePlayer} />
                )}
            </div>
            <p className="mt-3 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {filtered
                    ? `${rows.length} players match “${player}”`
                    : `${rows.length} rows`}
            </p>
            <LadderTable rows={rows} variant="full" className="mt-2" />

            {/* A filtered board has only the first page: the filter is a
                prefix search, not a paged listing. */}
            {filtered ? null : (
                <PageNav
                    prevHref={
                        page > 1
                            ? ladderHref(bracket, region, page - 1)
                            : undefined
                    }
                    nextHref={
                        hasNextPage
                            ? ladderHref(bracket, region, page + 1)
                            : undefined
                    }
                />
            )}
        </div>
    )
}
