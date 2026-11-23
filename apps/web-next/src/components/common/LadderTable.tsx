import { Card } from "@/components/ui/card"
import { EntityLink } from "@/components/common/EntityLink"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { legendIconSrc, regionFlagSrc } from "@/lib/assets"
import { useLegendIcon } from "@/lib/media"
import { playerHref, tierColor } from "@/lib/rankings"
import { winRate } from "@/lib/stats"
import { cn } from "@/lib/cn"
import type { LadderLegend, LadderRow } from "@/lib/ladderRows"
import type { CSSProperties } from "react"

export type LadderTableVariant = "full" | "compact"

const percent = (wins: number, games: number): string =>
    `${Math.round(winRate(wins, games))}%`

/**
 * Games, wins, losses and win rate. Hidden on a phone, where the same numbers
 * sit under the player's name instead of in columns the screen cannot hold.
 */
const PlayRecord = ({
    games,
    wins,
    className,
}: {
    readonly games: number
    readonly wins: number
    readonly className?: string
}) => {
    const cell = cn("hidden text-right tabular-nums sm:table-cell", className)

    return (
        <>
            <TableCell className={cell}>{games}</TableCell>
            <TableCell className={cell}>
                {wins}
                <span className="ml-1 text-xs text-muted-foreground">
                    ({percent(wins, games)})
                </span>
            </TableCell>
            <TableCell className={cell}>
                {games - wins}
                <span className="ml-1 text-xs text-muted-foreground">
                    ({percent(games - wins, games)})
                </span>
            </TableCell>
            <TableCell className={cell}>{percent(wins, games)}</TableCell>
        </>
    )
}

/** The phone row: the columns the board stacks under the name. */
const StackedRecord = ({ row }: { readonly row: LadderRow }) => (
    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.66rem] text-muted-foreground sm:hidden">
        <TierBadge tier={row.tier} />
        <span>{row.games} games</span>
        <span>
            {row.wins}W ({percent(row.wins, row.games)})
        </span>
        <span>
            {row.games - row.wins}L ({percent(row.games - row.wins, row.games)})
        </span>
        <span>{row.rating} rating</span>
        <span>{row.peakRating} peak</span>
    </span>
)

/** The hook reads the CMS registry, so it needs a component of its own. */
const LegendIcon = ({ legend }: { readonly legend: LadderLegend }) => (
    <img
        src={useLegendIcon(legend.nameKey, legendIconSrc(legend.nameKey))}
        alt={legend.name}
        title={legend.name}
        className="size-6 shrink-0 object-contain"
    />
)

const RegionFlag = ({ region }: { readonly region: string }) => (
    <img
        src={regionFlagSrc(region)}
        alt={`${region.toUpperCase()} region`}
        title={`${region.toUpperCase()} region`}
        className="h-4 w-6 shrink-0 rounded-sm object-contain"
    />
)

const TierBadge = ({ tier }: { readonly tier: string }) => (
    <span
        className="ch-tier"
        style={{ "--ch-tier": tierColor(tier) } as CSSProperties}
    >
        {tier}
    </span>
)

const Members = ({ row }: { readonly row: LadderRow }) => (
    <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
        {row.members.map((member) => (
            <EntityLink
                key={member.id}
                type="player"
                id={member.id}
                href={playerHref(member.slug)}
                className="font-semibold"
            >
                {member.name}
            </EntityLink>
        ))}
    </span>
)

export const LadderTable = ({
    rows,
    variant = "compact",
    className,
}: {
    readonly rows: readonly LadderRow[]
    readonly variant?: LadderTableVariant
    readonly className?: string
}) => {
    const full = variant === "full"

    return (
        // A `Card`, so a table panel is the same rounded surface as every other.
        // The full board stacks its record under the name on a phone and only
        // becomes a wide table from `sm` up, so nothing overflows the viewport.
        <Card className={cn("overflow-hidden py-0", className)}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-7">#</TableHead>
                        {full && (
                            <TableHead className="w-8">
                                <span className="sr-only">Region</span>
                            </TableHead>
                        )}
                        <TableHead>Player</TableHead>
                        {full && (
                            <>
                                <TableHead className="hidden sm:table-cell">
                                    Tier
                                </TableHead>
                                <TableHead className="hidden text-right sm:table-cell">
                                    Games
                                </TableHead>
                                <TableHead className="hidden text-right sm:table-cell">
                                    W
                                </TableHead>
                                <TableHead className="hidden text-right sm:table-cell">
                                    L
                                </TableHead>
                                <TableHead className="hidden text-right sm:table-cell">
                                    Win rate
                                </TableHead>
                                <TableHead className="hidden text-right sm:table-cell">
                                    Rating
                                </TableHead>
                                <TableHead className="hidden text-right sm:table-cell">
                                    Peak
                                </TableHead>
                            </>
                        )}
                        {!full && (
                            <>
                                <TableHead className="w-14 text-right">
                                    Rating
                                </TableHead>
                                <TableHead className="hidden w-24 text-right sm:table-cell">
                                    Tier
                                </TableHead>
                            </>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.key}>
                            <TableCell>
                                <span
                                    className={cn(
                                        "ch-rank",
                                        row.rank <= 3 && `ch-rank-${row.rank}`,
                                    )}
                                >
                                    <span>{row.rank}</span>
                                </span>
                            </TableCell>
                            {full && (
                                <>
                                    <TableCell>
                                        <RegionFlag region={row.region} />
                                    </TableCell>
                                    <TableCell className="whitespace-normal">
                                        <span className="flex min-w-0 items-center gap-2">
                                            {row.legend === undefined ? null : (
                                                <LegendIcon
                                                    legend={row.legend}
                                                />
                                            )}
                                            <span className="flex min-w-0 flex-col">
                                                <Members row={row} />
                                                <StackedRecord row={row} />
                                            </span>
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <TierBadge tier={row.tier} />
                                    </TableCell>
                                    <PlayRecord
                                        games={row.games}
                                        wins={row.wins}
                                    />
                                    <TableCell className="hidden text-right font-bold tabular-nums sm:table-cell">
                                        {row.rating}
                                    </TableCell>
                                    <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                                        {row.peakRating}
                                    </TableCell>
                                </>
                            )}
                            {!full && (
                                <>
                                    <TableCell className="whitespace-normal">
                                        <span className="flex flex-col gap-1">
                                            <Members row={row} />
                                            <span className="sm:hidden">
                                                <TierBadge tier={row.tier} />
                                            </span>
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums">
                                        {row.rating}
                                    </TableCell>
                                    <TableCell className="hidden text-right sm:table-cell">
                                        <TierBadge tier={row.tier} />
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}
