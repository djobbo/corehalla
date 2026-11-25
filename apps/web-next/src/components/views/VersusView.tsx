import { useAtomValue } from "@effect/atom-react"
import { Link, useNavigate } from "@tanstack/react-router"
import { Atom } from "effect/reactivity"
import * as AsyncResult from "effect/reactivity/AsyncResult"
import { useId, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { playerProfileAtom, lookupAtom, useQuery } from "@/effect/atoms"
import { legendIconSrc } from "@/lib/assets"
import { cn } from "@/lib/cn"
import { comparePlayers, legendWinRate, sharedLegends } from "@/lib/compare"
import { legendPageHref } from "@/lib/legends"
import { useLegendIcon } from "@/lib/media"
import { VersusModeSwitch } from "./VersusModeSwitch"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"
import { cleanString } from "@crh/common/helpers/cleanString"
import type {
    ComparisonRow,
    SharedLegendRow,
    SharedLegendSide,
} from "@/lib/compare"
import type { LookupResult, PlayerProfile } from "@crh/api-contract/schemas"

const PICKER_LIMIT = 6

const idleLookupAtom = Atom.make(
    AsyncResult.success([] as readonly LookupResult[]),
)

/** The name half of an entity slug; the id half is noise to a reader. */
const nameFromSlug = (slug: string): string => {
    const name = slug.replace(/^\d+-?/, "").replaceAll("-", " ")

    return name === "" ? slug : name
}

const suggestionMeta = (player: LookupResult): string =>
    [
        player.tier,
        player.rating === null ? null : `${player.rating} rating`,
        player.region?.toUpperCase(),
    ]
        .filter((part) => part !== null && part !== undefined)
        .join(" · ")

const PlayerField = ({
    label,
    placeholder,
    query,
    committed,
    onChange,
    onPick,
}: {
    readonly label: string
    readonly placeholder: string
    readonly query: string
    readonly committed: boolean
    readonly onChange: (value: string) => void
    readonly onPick: (player: LookupResult) => void
}) => {
    const id = useId()
    const needle = query.trim()
    const active = needle.length >= MIN_LOOKUP_LENGTH ? needle : ""
    const [chosen, setChosen] = useState(committed)
    const lookup = useMemo(
        () =>
            active === ""
                ? idleLookupAtom
                : lookupAtom(active, "all", PICKER_LIMIT),
        [active],
    )

    const result = useAtomValue(lookup)
    const players =
        result._tag === "Success"
            ? result.value.filter((entry) => entry.type === "player")
            : []
    const listing = !chosen && active !== ""

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
                    setChosen(false)
                    onChange(event.target.value)
                }}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck={false}
            />
            {!listing ? null : players.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    No players match “{active}”.
                </p>
            ) : (
                <ul className="divide-y divide-border border border-border bg-card">
                    {players.map((player) => (
                        <li key={player.id}>
                            <button
                                type="button"
                                onClick={() => {
                                    setChosen(true)
                                    onPick(player)
                                }}
                                className="flex w-full items-baseline justify-between gap-3 px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-bgVar2"
                            >
                                <span className="truncate font-semibold">
                                    {cleanString(player.name)}
                                </span>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                    {suggestionMeta(player)}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export type VersusPickerProps = {
    readonly aSlug?: string | undefined
    readonly bSlug?: string | undefined
    readonly aName?: string | undefined
    readonly bName?: string | undefined
}

export const VersusPicker = ({
    aSlug,
    bSlug,
    aName,
    bName,
}: VersusPickerProps) => {
    const navigate = useNavigate()

    const [queryA, setQueryA] = useState(aName ?? nameFromSlug(aSlug ?? ""))
    const [queryB, setQueryB] = useState(bName ?? nameFromSlug(bSlug ?? ""))
    const [pickedA, setPickedA] = useState(aSlug)
    const [pickedB, setPickedB] = useState(bSlug)

    const pick = (side: "a" | "b", player: LookupResult): void => {
        const nextA = side === "a" ? player.slug : pickedA
        const nextB = side === "b" ? player.slug : pickedB

        if (side === "a") {
            setPickedA(player.slug)
            setQueryA(cleanString(player.name))
        } else {
            setPickedB(player.slug)
            setQueryB(cleanString(player.name))
        }

        // Choosing a player is a shareable fact: it goes in the URL, not in state.
        void navigate({ to: "/vs", search: { a: nextA, b: nextB } })
    }

    const ready = pickedA !== undefined && pickedB !== undefined

    const compare = (): void => {
        if (pickedA === undefined || pickedB === undefined) return

        void navigate({ to: "/vs", search: { a: pickedA, b: pickedB } })
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <PlayerField
                    label="Player one"
                    placeholder="Search a player…"
                    query={queryA}
                    committed={aSlug !== undefined}
                    onChange={(value) => {
                        setQueryA(value)
                        setPickedA(undefined)
                    }}
                    onPick={(player) => pick("a", player)}
                />
                <PlayerField
                    label="Player two"
                    placeholder="Search a player…"
                    query={queryB}
                    committed={bSlug !== undefined}
                    onChange={(value) => {
                        setQueryB(value)
                        setPickedB(undefined)
                    }}
                    onPick={(player) => pick("b", player)}
                />
            </div>
            <div className="flex justify-end">
                <Button type="button" disabled={!ready} onClick={compare}>
                    Compare
                </Button>
            </div>
        </div>
    )
}

const SideCell = ({
    side,
    row,
}: {
    readonly side: "a" | "b"
    readonly row: ComparisonRow
}) => {
    const better = row.winner === side

    return (
        <TableCell
            data-better={better ? "true" : undefined}
            className={cn(
                "text-right tabular-nums",
                better ? "font-bold text-foreground" : "text-muted-foreground",
            )}
        >
            {side === "a" ? row.a : row.b}
            {better ? <span className="sr-only"> (better)</span> : null}
        </TableCell>
    )
}

const VersusTable = ({
    a,
    b,
}: {
    readonly a: PlayerProfile
    readonly b: PlayerProfile
}) => {
    const rows = comparePlayers(a, b)

    return (
        <Card className="mt-4 overflow-hidden py-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-36">Metric</TableHead>
                        <TableHead className="text-right">
                            {cleanString(a.name)}
                        </TableHead>
                        <TableHead className="text-right">
                            {cleanString(b.name)}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.label}>
                            <TableCell className="text-xs text-muted-foreground">
                                {row.label}
                            </TableCell>
                            <SideCell side="a" row={row} />
                            <SideCell side="b" row={row} />
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}

const legendCount = (value: number): string => value.toLocaleString("en-US")

const SideRecord = ({
    name,
    side,
}: {
    readonly name: string
    readonly side: SharedLegendSide
}) => (
    <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-semibold text-foreground">{name}</span>
        <span>{legendCount(side.games)} games</span>
        <span>{legendWinRate(side)} win rate</span>
        <span>level {legendCount(side.level)}</span>
    </span>
)

const SideColumns = ({ side }: { readonly side: SharedLegendSide }) => (
    <>
        <TableCell className="hidden text-right tabular-nums sm:table-cell">
            {legendCount(side.games)}
        </TableCell>
        <TableCell className="hidden text-right tabular-nums sm:table-cell">
            {legendWinRate(side)}
        </TableCell>
        <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
            {legendCount(side.level)}
        </TableCell>
    </>
)

/** The icon hook needs a component of its own. */
const SharedLegendLink = ({ row }: { readonly row: SharedLegendRow }) => {
    const src = useLegendIcon(row.nameKey, legendIconSrc(row.nameKey))

    return (
        <Link
            to={legendPageHref(row.slug)}
            className="flex items-center gap-2 font-semibold transition-colors hover:text-ring"
        >
            <img src={src} alt="" className="size-6 shrink-0 object-contain" />
            {row.name}
        </Link>
    )
}

const legendColumnLabels = [
    "Games",
    "Win rate",
    "Level",
    "Games",
    "Win rate",
    "Level",
] as const

const sharedLegendsEmpty = (
    nameA: string,
    nameB: string,
    poolA: boolean,
    poolB: boolean,
): string => {
    if (!poolA && !poolB)
        return `${nameA} and ${nameB} have no legend games yet.`

    if (!poolA) return `${nameA} has no legend games yet.`

    if (!poolB) return `${nameB} has no legend games yet.`

    return `${nameA} and ${nameB} have not played any of the same legends.`
}

const SharedLegendsPanel = ({
    a,
    b,
}: {
    readonly a: PlayerProfile
    readonly b: PlayerProfile
}) => {
    const nameA = cleanString(a.name)
    const nameB = cleanString(b.name)
    const { rows, hidden } = sharedLegends(a, b)
    const poolA = a.legend_bubbles.some((legend) => legend.games > 0)
    const poolB = b.legend_bubbles.some((legend) => legend.games > 0)

    return (
        <section aria-labelledby="shared-legends-title" className="mt-6">
            <p className="ch-kicker">Legend pool</p>
            <h2 id="shared-legends-title" className="ch-display mt-1 text-lg">
                Shared legends
            </h2>
            <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                Legends both players have played, ordered by their combined
                games.
            </p>
            {rows.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    {sharedLegendsEmpty(nameA, nameB, poolA, poolB)}
                </p>
            ) : (
                <>
                    <Card className="mt-3 overflow-hidden py-0">
                        <Table>
                            <TableHeader className="hidden sm:table-header-group">
                                <TableRow>
                                    <TableHead
                                        rowSpan={2}
                                        className="align-bottom shadow-none"
                                    >
                                        Legend
                                    </TableHead>
                                    <TableHead
                                        colSpan={3}
                                        className="text-right shadow-none"
                                    >
                                        {nameA}
                                    </TableHead>
                                    <TableHead
                                        colSpan={3}
                                        className="text-right shadow-none"
                                    >
                                        {nameB}
                                    </TableHead>
                                </TableRow>
                                <TableRow>
                                    {legendColumnLabels.map((label, index) => (
                                        <TableHead
                                            key={`${label}-${index}`}
                                            className="w-20 text-right"
                                        >
                                            {label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="whitespace-normal">
                                            <SharedLegendLink row={row} />
                                            <span className="mt-1 flex flex-col gap-0.5 text-[0.66rem] text-muted-foreground sm:hidden">
                                                <SideRecord
                                                    name={nameA}
                                                    side={row.a}
                                                />
                                                <SideRecord
                                                    name={nameB}
                                                    side={row.b}
                                                />
                                            </span>
                                        </TableCell>
                                        <SideColumns side={row.a} />
                                        <SideColumns side={row.b} />
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                    {hidden > 0 ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                            {hidden} more shared legend
                            {hidden === 1 ? "" : "s"} not shown.
                        </p>
                    ) : null}
                </>
            )}
        </section>
    )
}

export type VersusViewProps = {
    readonly a: PlayerProfile | null
    readonly b: PlayerProfile | null
    readonly aSlug?: string | undefined
    readonly bSlug?: string | undefined
}

export const VersusView = ({ a, b, aSlug, bSlug }: VersusViewProps) => {
    const nameA = a === null ? undefined : cleanString(a.name)
    const nameB = b === null ? undefined : cleanString(b.name)
    const both = a !== null && b !== null

    return (
        <div>
            <header className="ch-hero mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="ch-kicker">Head to head</p>
                    <h1 className="ch-display mt-1 text-2xl">
                        {both ? `${nameA} vs ${nameB}` : "Compare players"}
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Career totals and this season's ranked numbers, side by
                        side.
                    </p>
                </div>
                <VersusModeSwitch mode="players" />
            </header>
            <Card className="p-4">
                <VersusPicker
                    aSlug={aSlug}
                    bSlug={bSlug}
                    aName={nameA}
                    bName={nameB}
                />
            </Card>
            {a !== null && b !== null ? (
                <>
                    <VersusTable a={a} b={b} />
                    <SharedLegendsPanel a={a} b={b} />
                </>
            ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                    Pick{" "}
                    {a === null && b === null ? "two players" : "an opponent"}{" "}
                    to see the comparison.
                </p>
            )}
        </div>
    )
}

/** Both sides in the URL: the loader has already put both profiles in the registry. */
export const VersusLoader = ({
    aId,
    bId,
    aSlug,
    bSlug,
}: {
    readonly aId: number
    readonly bId: number
    readonly aSlug?: string | undefined
    readonly bSlug?: string | undefined
}) => {
    const a = useQuery(playerProfileAtom(aId)).data
    const b = useQuery(playerProfileAtom(bId)).data

    return (
        <VersusView
            a={a}
            b={b}
            aSlug={aSlug ?? a.slug}
            bSlug={bSlug ?? b.slug}
        />
    )
}
