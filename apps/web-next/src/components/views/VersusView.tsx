import { useAtomValue } from "@effect/atom-react"
import { useNavigate } from "@tanstack/react-router"
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
import { cn } from "@/lib/cn"
import { comparePlayers } from "@/lib/compare"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { ComparisonRow } from "@/lib/compare"
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
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Head to head</p>
                <h1 className="ch-display mt-1 text-2xl">
                    {both ? `${nameA} vs ${nameB}` : "Compare players"}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                    Career totals and this season's ranked numbers, side by
                    side.
                </p>
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
                <VersusTable a={a} b={b} />
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
