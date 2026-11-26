import { Link } from "@tanstack/react-router"
import { EntityLink } from "@/components/common/EntityLink"
import { Card } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { landingGuilds } from "@/lib/landingGuilds"
import { guildRankingsHref } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import type { ClanRanking } from "@crh/api-contract/schemas"

export const TopGuilds = ({
    board,
}: {
    readonly board: readonly ClanRanking[] | null
}) => {
    const guilds = landingGuilds(board)

    if (guilds.length === 0) return null

    return (
        <div className="flex flex-col gap-3">
            <h2 className="ch-display text-lg">
                <Link
                    to={guildRankingsHref()}
                    className="inline-flex items-baseline gap-1.5 transition-colors hover:text-ring"
                >
                    Top guilds
                    <span aria-hidden className="text-xs">
                        &rarr;
                    </span>
                </Link>
            </h2>
            <Card className="overflow-hidden py-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-7">#</TableHead>
                            <TableHead>Guild</TableHead>
                            <TableHead className="w-24 text-right">
                                XP
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {guilds.map((guild) => (
                            <TableRow key={guild.id}>
                                <TableCell>
                                    <span
                                        className={cn(
                                            "ch-rank",
                                            guild.rank <= 3 &&
                                                `ch-rank-${guild.rank}`,
                                        )}
                                    >
                                        <span>{guild.rank}</span>
                                    </span>
                                </TableCell>
                                <TableCell className="whitespace-normal">
                                    <EntityLink
                                        type="clan"
                                        id={guild.id}
                                        href={guild.href}
                                        className="font-semibold"
                                    >
                                        {guild.name}
                                    </EntityLink>
                                </TableCell>
                                <TableCell className="text-right font-bold tabular-nums">
                                    {guild.xp}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
