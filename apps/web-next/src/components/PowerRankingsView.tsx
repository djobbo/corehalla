import { Link } from "@tanstack/react-router"
import { EntityLink } from "./EntityLink"
import { PageNav } from "./PageNav"
import { SelectField } from "./SelectField"
import { UpdatedAt } from "./UpdatedAt"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { cn } from "@/lib/cn"
import {
    playerHref,
    powerGameModes,
    powerHref,
    powerOrderBys,
    powerRegions,
} from "@/lib/rankings"
import type {
    PowerRankingsGameMode,
    PowerRankingsOrderBy,
    PowerRankingsPlayer,
    PowerRankingsRegion,
} from "@crh/api-contract/schemas"

const earningsFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
})

const pointsFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
})

const medal = (count: number): string => (count > 0 ? String(count) : "—")

/** Country/pronoun and social links — all null until brawltools populates them. */
const PlayerMeta = ({ player }: { readonly player: PowerRankingsPlayer }) => {
    const labels = [player.country, player.pronoun].filter(
        (value): value is string => value !== null,
    )
    const hasSocials = player.twitter !== null || player.twitch !== null

    if (labels.length === 0 && !hasSocials) return null

    return (
        <span className="flex flex-wrap items-center gap-x-2 text-xs font-normal text-muted-foreground">
            {labels.length > 0 && <span>{labels.join(" · ")}</span>}
            {player.twitter !== null && (
                <a
                    href={`https://twitter.com/${player.twitter}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ring"
                >
                    @{player.twitter}
                </a>
            )}
            {player.twitch !== null && (
                <a
                    href={`https://twitch.tv/${player.twitch}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ring"
                >
                    twitch.tv/{player.twitch}
                </a>
            )}
        </span>
    )
}

export const PowerRankingsView = ({
    gameMode,
    region,
    page,
    orderBy,
    players,
    totalPages,
    updatedAt,
    onOrderByChange,
}: {
    readonly gameMode: PowerRankingsGameMode
    readonly region: PowerRankingsRegion
    readonly page: number
    readonly orderBy: PowerRankingsOrderBy
    readonly players: readonly PowerRankingsPlayer[]
    readonly totalPages: number
    readonly updatedAt: number
    readonly onOrderByChange: (orderBy: PowerRankingsOrderBy) => void
}) => (
    <div>
        <header className="ch-hero mb-3">
            <p className="ch-kicker">Power rankings</p>
            <h1 className="ch-display mt-1 text-2xl">
                {gameMode} power rankings
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
                {region} · page {page} of {totalPages}
            </p>
            <UpdatedAt at={updatedAt} className="block" />
        </header>

        <div className="sticky top-[var(--ch-header-h)] z-20 -mx-4 bg-background/95 px-4 py-2 shadow-[0_3px_0_0_var(--color-ink)] backdrop-blur">
            <nav aria-label="Game mode" className="flex flex-wrap gap-1.5">
                {powerGameModes.map((option) => (
                    <Link
                        key={option.value}
                        to={powerHref(option.value, region, 1, orderBy)}
                        className={cn(
                            "ch-chip",
                            option.value === gameMode
                                ? "ch-chip-on"
                                : "ch-chip-off",
                        )}
                    >
                        {option.label}
                    </Link>
                ))}
            </nav>
            <nav aria-label="Region" className="mt-1.5 flex flex-wrap gap-1.5">
                {powerRegions.map((option) => (
                    <Link
                        key={option.value}
                        to={powerHref(gameMode, option.value, 1, orderBy)}
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
        </div>

        <SelectField
            label="Rank by"
            value={orderBy}
            options={powerOrderBys}
            onChange={onOrderByChange}
            className="mt-3 sm:max-w-sm"
        />

        {players.length === 0 ? (
            <Empty className="mt-4 bg-card py-8">
                <EmptyHeader>
                    <EmptyDescription>
                        No power-ranked players in {region} {gameMode}.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        ) : (
            <div className="mt-4 overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 text-right">
                                PR
                            </TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="w-16 text-right">
                                Gold
                            </TableHead>
                            <TableHead className="w-16 text-right">
                                Silver
                            </TableHead>
                            <TableHead className="w-16 text-right">
                                Bronze
                            </TableHead>
                            <TableHead className="w-16 text-right">
                                Top 8
                            </TableHead>
                            <TableHead className="w-16 text-right">
                                Top 32
                            </TableHead>
                            <TableHead className="w-20 text-right">
                                Points
                            </TableHead>
                            <TableHead className="w-24 text-right">
                                Earnings
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map((player) => (
                            <TableRow key={player.esportsId}>
                                <TableCell className="text-right font-bold tabular-nums">
                                    {player.powerRanking}
                                </TableCell>
                                <TableCell title={player.fullName ?? undefined}>
                                    <span className="flex min-w-0 flex-col">
                                        {player.slug === null ||
                                        player.brawlhallaId === null ? (
                                            <span className="font-semibold">
                                                {player.playerName}
                                            </span>
                                        ) : (
                                            <EntityLink
                                                type="player"
                                                id={player.brawlhallaId}
                                                href={playerHref(player.slug)}
                                                className="font-semibold"
                                            >
                                                {player.playerName}
                                            </EntityLink>
                                        )}
                                        <PlayerMeta player={player} />
                                    </span>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {medal(player.gold)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {medal(player.silver)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {medal(player.bronze)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {player.top8}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {player.top32}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {pointsFormat.format(player.points)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {earningsFormat.format(player.earnings)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}

        <PageNav
            prevHref={
                page > 1
                    ? powerHref(gameMode, region, page - 1, orderBy)
                    : undefined
            }
            nextHref={
                page < totalPages
                    ? powerHref(gameMode, region, page + 1, orderBy)
                    : undefined
            }
        />
    </div>
)
