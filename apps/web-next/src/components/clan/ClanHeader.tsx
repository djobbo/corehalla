import { Card, CardContent } from "@/components/ui/card"
import { FavoriteButton } from "@/components/account/FavoriteButton"
import { StatGrid } from "@/components/common/StatGrid"
import { UpdatedAt } from "@/components/common/UpdatedAt"
import { guildAtom, useQuery } from "@/effect/atoms"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { Stat } from "@/components/common/StatGrid"

export const ClanHeader = ({ clanId }: { readonly clanId: number }) => {
    const envelope = useQuery(guildAtom(clanId))
    const guild = envelope.data

    const name = cleanString(guild.name)

    const memberPoints = guild.members.reduce(
        (sum, member) => sum + (member.guild_points ?? 0),
        0,
    )
    const summedPoints = guild.members.some(
        (member) => member.guild_points !== undefined,
    )
        ? memberPoints
        : undefined

    const guildPoints = guild.guild_points ?? summedPoints

    const stats: Stat[] = [
        {
            title: "Level",
            value: guild.level,
            hint: `${guild.xp_percentage.toFixed(0)}% toward the next level`,
        },
        { title: "Clan XP", value: guild.xp.toLocaleString() },
        {
            title: "Guild points",
            value:
                guildPoints === undefined ? "—" : guildPoints.toLocaleString(),
            hint: "Points earned in guild battles, across everyone who has contributed — not just the current roster",
        },
        { title: "Members", value: guild.members.length.toLocaleString() },
        {
            title: "Created",
            value: formatUnixTime(guild.created_at),
        },
    ]

    return (
        <header className="flex flex-col gap-3">
            <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-2 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-muted-foreground"
            >
                <span>Brawlhalla</span>
                <span aria-hidden className="text-muted-foreground/40">
                    /
                </span>
                <span>Guilds</span>
                <span aria-hidden className="text-muted-foreground/40">
                    /
                </span>
                <span>#{guild.id}</span>
                <span aria-hidden className="text-muted-foreground/40">
                    ·
                </span>
                <UpdatedAt
                    at={envelope.meta.updated_at}
                    className="normal-case tracking-normal"
                />
            </nav>
            <div className="flex flex-wrap items-center gap-3">
                <span aria-hidden className="ch-mark h-9 w-9 text-base">
                    <span>{name.slice(0, 1).toUpperCase()}</span>
                </span>
                <h1 className="ch-display text-2xl sm:text-3xl">{name}</h1>
                <FavoriteButton type="clan" id={String(guild.id)} name={name} />
            </div>
            <Card className="@container bg-transparent p-4 shadow-none">
                <CardContent className="p-0">
                    <StatGrid maxColumns={5} stats={stats} />
                </CardContent>
            </Card>
        </header>
    )
}
