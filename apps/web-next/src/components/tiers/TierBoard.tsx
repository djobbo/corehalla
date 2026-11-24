import { legendsMap } from "@crh/bhapi/legends"
import { Link } from "@tanstack/react-router"
import {
    Check,
    Copy,
    GripVertical,
    MoreVertical,
    RotateCcw,
} from "lucide-react"
import { useEffect, useState } from "react"
import type { CSSProperties, DragEvent } from "react"
import { LegendIcon } from "@/components/legend/LegendIcon"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/cn"
import { legendHref } from "@/lib/legends"
import {
    poolLegends,
    tierLegends,
    tierListHref,
    tierNames,
    type TierBoard as TierBoardState,
    type TierName,
} from "@/lib/tierList"

const tierColors: Readonly<Record<TierName, string>> = {
    S: "var(--color-warning)",
    A: "var(--color-danger)",
    B: "var(--color-brandAlt)",
    C: "var(--color-brandVar1)",
    D: "var(--color-success)",
    F: "var(--muted-foreground)",
}

type DropZone = TierName | "pool"

type CopyState = "idle" | "copied" | "failed"

export type TierBoardProps = {
    readonly board: TierBoardState
    readonly onPlace: (legendId: number, tier: TierName | null) => void
    readonly onReset: () => void
}

const TierBadge = ({ tier }: { readonly tier: TierName }) => (
    <span
        className="ch-tier"
        style={{ "--ch-tier": tierColors[tier] } as CSSProperties}
    >
        {tier}
    </span>
)

const LegendTile = ({
    legendId,
    tier,
    onMove,
}: {
    readonly legendId: number
    readonly tier: TierName | null
    readonly onMove: (tier: TierName | null) => void
}) => {
    const legend = legendsMap[legendId]

    if (legend === undefined) return null

    return (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- HTML5 drag belongs to the list item; the menu is the keyboard path.
        <li
            draggable
            onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(legendId))
                event.dataTransfer.effectAllowed = "move"
            }}
            className="flex min-w-0 max-w-full items-center gap-0.5 bg-card py-0.5 pr-0.5 pl-1 shadow-sm"
        >
            <GripVertical
                aria-hidden
                className="size-3 shrink-0 text-muted-foreground"
            />
            <Link
                to={legendHref(legend)}
                className="flex min-w-0 items-center gap-1.5 py-1 focus-visible:outline-2 focus-visible:outline-ring"
            >
                <LegendIcon
                    legend={legend}
                    className="size-5 shrink-0 object-contain"
                />
                <span className="truncate text-xs font-semibold">
                    {legend.bio_name}
                </span>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label={`Move ${legend.bio_name} to a tier`}
                    className="inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground"
                >
                    <MoreVertical aria-hidden className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        Move {legend.bio_name}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                        disabled={tier === null}
                        onClick={() => onMove(null)}
                    >
                        Unranked pool
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {tierNames.map((name) => (
                        <DropdownMenuItem
                            key={name}
                            onClick={() => onMove(name)}
                        >
                            <TierBadge tier={name} />
                            <span className="flex-1">{name} tier</span>
                            {tier === name && (
                                <Check aria-hidden className="size-3" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </li>
    )
}

const LegendTiles = ({
    ids,
    tier,
    onMove,
}: {
    readonly ids: readonly number[]
    readonly tier: TierName | null
    readonly onMove: (legendId: number, tier: TierName | null) => void
}) => (
    <>
        {ids.map((id) => (
            <LegendTile
                key={id}
                legendId={id}
                tier={tier}
                onMove={(next) => onMove(id, next)}
            />
        ))}
    </>
)

export const TierBoard = ({ board, onPlace, onReset }: TierBoardProps) => {
    const [dropZone, setDropZone] = useState<DropZone | null>(null)
    const [copyState, setCopyState] = useState<CopyState>("idle")
    const [announcement, setAnnouncement] = useState("")

    useEffect(() => {
        if (copyState === "idle") return

        const timer = setTimeout(() => setCopyState("idle"), 2400)

        return () => clearTimeout(timer)
    }, [copyState])

    const pool = poolLegends(board)

    const move = (legendId: number, tier: TierName | null) => {
        const name = legendsMap[legendId]?.bio_name ?? "Legend"

        onPlace(legendId, tier)
        setAnnouncement(
            `${name} moved to ${tier === null ? "the unranked pool" : `${tier} tier`}.`,
        )
    }

    const reset = () => {
        onReset()
        setAnnouncement("Tier list reset.")
    }

    const copyLink = async () => {
        const url = new URL(tierListHref(board), window.location.origin).href

        try {
            await navigator.clipboard.writeText(url)
            setCopyState("copied")
        } catch {
            setCopyState("failed")
        }
    }

    const dragOver = (zone: DropZone) => (event: DragEvent<HTMLElement>) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        setDropZone(zone)
    }

    const dragLeave = (event: DragEvent<HTMLElement>) => {
        const next = event.relatedTarget

        if (next instanceof Node && event.currentTarget.contains(next)) return

        setDropZone(null)
    }

    const drop = (zone: DropZone) => (event: DragEvent<HTMLElement>) => {
        event.preventDefault()
        setDropZone(null)

        const raw = event.dataTransfer.getData("text/plain")
        const legendId = Number(raw)

        if (raw !== "" && legendsMap[legendId] !== undefined) {
            move(legendId, zone === "pool" ? null : zone)
        }
    }

    const dropTargetProps = (zone: DropZone) => ({
        onDragOver: dragOver(zone),
        onDragLeave: dragLeave,
        onDrop: drop(zone),
    })

    const placed = tierNames.reduce(
        (total, tier) => total + board[tier].length,
        0,
    )

    return (
        <main id="main" tabIndex={-1} className="ch-page">
            <header className="ch-hero mb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="ch-kicker">Tools</p>
                        <h1 className="ch-display mt-1 text-2xl md:text-3xl">
                            Legend tier list
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => void copyLink()}
                        >
                            {copyState === "copied" ? (
                                <Check aria-hidden />
                            ) : (
                                <Copy aria-hidden />
                            )}
                            {copyState === "copied"
                                ? "Link copied"
                                : copyState === "failed"
                                  ? "Copy failed"
                                  : "Copy link"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={placed === 0}
                            onClick={reset}
                        >
                            <RotateCcw aria-hidden />
                            Reset
                        </Button>
                    </div>
                </div>
                <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
                    Drag a legend into a tier, or open its menu to move it
                    without a mouse. The address bar carries the whole board, so
                    sharing the link shares the ranking.
                </p>
            </header>

            <output aria-live="polite" className="sr-only">
                {copyState === "copied"
                    ? "Link copied to the clipboard."
                    : copyState === "failed"
                      ? "Could not copy the link."
                      : announcement}
            </output>

            <section aria-label="Tiers" className="flex flex-col gap-1.5">
                {tierNames.map((tier) => {
                    const legends = tierLegends(board, tier)

                    return (
                        <div
                            key={tier}
                            className="flex min-w-0 items-stretch gap-1.5"
                        >
                            <div
                                aria-hidden
                                className="flex w-9 shrink-0 items-center justify-center bg-card"
                                style={{
                                    color: tierColors[tier],
                                }}
                            >
                                <span className="ch-display text-xl">
                                    {tier}
                                </span>
                            </div>
                            <ul
                                aria-label={`${tier} tier`}
                                {...dropTargetProps(tier)}
                                className={cn(
                                    "flex min-h-14 min-w-0 flex-1 list-none flex-wrap content-start gap-1.5 bg-bgVar2 p-1.5 transition-colors",
                                    dropZone === tier &&
                                        "bg-accent outline-2 outline-ring",
                                )}
                            >
                                {legends.length === 0 ? (
                                    <li className="px-1 py-3 text-xs text-muted-foreground">
                                        Drop or move a legend here.
                                    </li>
                                ) : (
                                    <LegendTiles
                                        ids={board[tier]}
                                        tier={tier}
                                        onMove={move}
                                    />
                                )}
                            </ul>
                        </div>
                    )
                })}
            </section>

            <section aria-label="Unranked pool" className="mt-4">
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <h2 className="ch-display text-sm">Unranked pool</h2>
                    <span className="ch-stat-label">
                        {pool.length} unranked
                    </span>
                </div>
                <ul
                    aria-label="Unranked legends"
                    {...dropTargetProps("pool")}
                    className={cn(
                        "flex min-h-16 min-w-0 list-none flex-wrap content-start gap-1.5 bg-bgVar2 p-1.5 transition-colors",
                        dropZone === "pool" &&
                            "bg-accent outline-2 outline-ring",
                    )}
                >
                    <LegendTiles
                        ids={pool.map((legend) => legend.legend_id)}
                        tier={null}
                        onMove={move}
                    />
                </ul>
            </section>
        </main>
    )
}
