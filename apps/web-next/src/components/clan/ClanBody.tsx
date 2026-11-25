import { SortControl } from "@/components/common/SortControl"
import { GuildRankedStrength } from "./GuildRankedStrength"
import { MemberCard } from "./MemberCard"
import { TopContributors } from "./TopContributors"
import { guildAtom, useQuery } from "@/effect/atoms"
import { compareMemberRating } from "@/lib/guildRatings"
import { useSortBy } from "@/lib/useSortBy"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { Guild, GuildMember } from "@crh/api-contract/schemas"
import type { ClanRank } from "@crh/bhapi/constants"
import type { SortOption } from "@/lib/useSortBy"

type Member = GuildMember

type MemberSort = "rank" | "rating" | "xp" | "points" | "joined"

const rankWeight: Record<ClanRank, number> = {
    Leader: 0,
    Officer: 1,
    Member: 2,
    Recruit: 3,
}

const sortOptions: Record<MemberSort, SortOption<Member>> = {
    rank: {
        label: "Rank",
        compare: (a, b) =>
            rankWeight[a.rank as ClanRank] - rankWeight[b.rank as ClanRank] ||
            a.joined_at - b.joined_at,
        display: (member) => member.rank,
    },
    rating: {
        label: "Rating",
        compare: compareMemberRating,
        display: (member) =>
            member.ranked === null
                ? "No 1v1 rating in Corehalla's index"
                : `${member.ranked.rating.toLocaleString()} rating`,
    },
    xp: {
        label: "XP",
        compare: (a, b) => a.xp - b.xp,
        display: (member) => `${member.xp.toLocaleString()} XP`,
    },
    points: {
        label: "Guild points",
        compare: (a, b) => (a.guild_points ?? 0) - (b.guild_points ?? 0),
        display: (member) =>
            member.guild_points === undefined
                ? "No guild points reported"
                : `${member.guild_points.toLocaleString()} guild points`,
    },
    joined: {
        label: "Join date",
        compare: (a, b) => a.joined_at - b.joined_at,
        display: (member) => formatUnixTime(member.joined_at),
    },
}

const Roster = ({ guild }: { readonly guild: Guild }) => {
    const sort = useSortBy<Member, MemberSort>(
        guild.members,
        sortOptions,
        "rank",
        "asc",
    )

    const reportsPoints = guild.members.some(
        (member) => member.guild_points !== undefined,
    )

    return (
        // Own `@container`: the roster's column count has to track the content
        // column, which is narrower than the viewport once the aside is beside it.
        <div className="@container flex flex-col gap-4">
            <SortControl
                label="Sort members by"
                value={sort.key}
                choices={sort.choices.filter(
                    (choice) => choice.value !== "points" || reportsPoints,
                )}
                onChange={sort.setKey}
                direction={sort.direction}
                onToggleDirection={sort.toggleDirection}
                className="sm:max-w-sm"
            />
            <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
                {sort.sorted.map((member) => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        clanXp={guild.xp}
                    />
                ))}
            </div>
        </div>
    )
}

export const ClanBody = ({ clanId }: { readonly clanId: number }) => {
    const guild = useQuery(guildAtom(clanId))

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
                <TopContributors members={guild.data.members} />
                <GuildRankedStrength members={guild.data.members} />
            </div>
            <Roster guild={guild.data} />
        </div>
    )
}
