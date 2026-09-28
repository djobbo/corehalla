import { Card, CardContent } from "@/components/ui/card"
import { FavoriteButton } from "@/components/account/FavoriteButton"
import { StatGrid } from "@/components/StatGrid"
import { clanStatsAtom, useQuery } from "@/effect/atoms"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { Stat } from "@/components/StatGrid"

/**
 * Who this page is about.
 *
 * Deliberately the same arrangement as `PlayerHeader`: a breadcrumb, then a
 * mark and the name ranged left, then the clan's figures as a ghost card. The
 * two pages answer the same question about different things, so they should
 * read as the same page — and the shape this replaced (a solid hero plate, a
 * kicker, one run-on line of facts) made a clan look like a different product
 * from the profiles it links to.
 *
 * A clan ships no artwork, so the mark standing in the player's region-flag
 * slot is the monogram — which is also the fallback the player header already
 * uses when there is no region to show. A clan always has a name, so unlike
 * there it is never a hole.
 */
export const ClanHeader = ({ clanId }: { readonly clanId: number }) => {
    const clan = useQuery(clanStatsAtom(clanId))

    if (!clan) {
        return (
            <p className="text-sm text-muted-foreground">
                No clan with id {clanId}.
            </p>
        )
    }

    const name = cleanString(clan.clan_name)
    const clanXp = Number(clan.clan_xp)
    const members = clan.clan.length

    /*
     * The clan's own total first, and only then the roster's sum.
     *
     * The two are not the same number and the sum is not a way to derive the
     * total: a clan keeps the points of everyone who has ever contributed, so
     * an active clan's roster adds up to less than its own figure — 13.7M
     * against 14.4M for the leaderboard's top guild. The sum is a fallback for
     * when v1 did not report the total at all, and it is only offered when a
     * member actually reported points, so an absent field cannot masquerade as
     * a clan that has earned none.
     */
    const memberPoints = clan.clan.reduce(
        (sum, member) => sum + (member.guild_points ?? 0),
        0,
    )
    const summedPoints = clan.clan.some(
        (member) => member.guild_points !== undefined,
    )
        ? memberPoints
        : undefined

    const guildPoints = clan.guild_points ?? summedPoints

    const stats: Stat[] = [
        { title: "Clan XP", value: clanXp.toLocaleString() },
        {
            title: "Guild points",
            value:
                guildPoints === undefined ? "—" : guildPoints.toLocaleString(),
            hint: "Points earned in guild battles, across everyone who has contributed — not just the current roster",
        },
        { title: "Members", value: members.toLocaleString() },
        { title: "Created", value: formatUnixTime(clan.clan_create_date) },
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
                <span>#{clan.clan_id}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
                <span aria-hidden className="ch-mark h-9 w-9 text-base">
                    <span>{name.slice(0, 1).toUpperCase()}</span>
                </span>
                <h1 className="ch-display text-2xl sm:text-3xl">{name}</h1>
                <FavoriteButton
                    type="clan"
                    id={String(clan.clan_id)}
                    name={name}
                />
            </div>

            {/*
             * The same ghost card `PlayerHeader` wears: no fill, so the clan's
             * own figures sit on the page rather than on a second plate under
             * the name. `p-4` is the old card's inset — the shadcn `Card` pads
             * its own content but not its edges — and `@container` is the query
             * context the figures' ladder measures against.
             */}
            <Card className="@container bg-transparent p-4 shadow-none">
                <CardContent className="p-0">
                    {/*
                     * Four figures, so the ladder tops out at four. The ladder is a
                     * ceiling, not a target: asking for more than there are items
                     * lays them across tracks that stay empty on a wide display.
                     */}
                    <StatGrid maxColumns={4} stats={stats} />
                </CardContent>
            </Card>
        </header>
    )
}
