import { SortControl } from "@/components/SortControl"
import { MemberCard } from "./MemberCard"
import { guildAtom, useQuery } from "@/effect/atoms"
import { useSortBy } from "@/lib/useSortBy"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { Guild, GuildMember } from "@crh/api-contract/schemas"
import type { ClanRank } from "@crh/bhapi/constants"
import type { SortOption } from "@/lib/useSortBy"

type Member = GuildMember

type MemberSort = "rank" | "xp" | "joined"

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
    xp: {
        label: "XP",
        compare: (a, b) => a.xp - b.xp,
        display: (member) => `${member.xp.toLocaleString()} XP`,
    },
    joined: {
        label: "Join date",
        compare: (a, b) => a.joined_at - b.joined_at,
        display: (member) => formatUnixTime(member.joined_at),
    },
}

const Roster = ({ guild }: { readonly guild: Guild }) => {
    const sort = useSortBy(guild.members, sortOptions, "rank", "asc")

    return (
        // Own `@container`: the roster's column count has to track the content
        // column, which is narrower than the viewport once the aside is beside it.
        <div className="@container flex flex-col gap-4">
            <SortControl
                label="Sort members by"
                value={sort.key}
                choices={sort.choices}
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

    return <Roster guild={guild.data} />
}
