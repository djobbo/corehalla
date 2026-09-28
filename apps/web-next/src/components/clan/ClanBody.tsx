import { SortControl } from "@/components/SortControl"
import { MemberCard } from "./MemberCard"
import { clanStatsAtom, useQuery } from "@/effect/atoms"
import { useSortBy } from "@/lib/useSortBy"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { Clan } from "@crh/bhapi/types"
import type { ClanRank } from "@crh/bhapi/constants"
import type { SortOption } from "@/lib/useSortBy"

/**
 * A clan's roster.
 *
 * The roster is the point of a clan page: a clan exists to be a set of players,
 * so every member links into their profile. That makes a clan something you
 * browse *through* rather than just a summary.
 *
 * The header above it lives in `./ClanHeader`, alongside this rather than in
 * it. The two answer to different atoms and different questions, and the player
 * page already splits the same way — `PlayerHeader` next to the tab bodies.
 */

// --- roster -----------------------------------------------------------------

type Member = Clan["clan"][number]

type MemberSort = "rank" | "xp" | "joined"

/**
 * A clan's standing order, lowest number first.
 *
 * The API sends the rank as a word, and the words have no alphabetical order
 * that means anything: `Leader < Member < Officer < Recruit` is exactly
 * backwards from how a clan is read.
 */
const rankWeight: Record<ClanRank, number> = {
    Leader: 0,
    Officer: 1,
    Member: 2,
    Recruit: 3,
}

const sortOptions: Record<MemberSort, SortOption<Member>> = {
    /*
     * Rank, then longest-serving first within a rank. The tiebreak is the
     * point: most of a clan shares the `Member` rank, so a comparator that
     * stopped at the rank would leave the majority of the roster in whatever
     * order the upstream happened to return — which today is join order, but
     * nothing promises that, and "the officers, then everyone else in the order
     * we got them" is not a sort.
     */
    rank: {
        label: "Rank",
        compare: (a, b) =>
            rankWeight[a.rank] - rankWeight[b.rank] ||
            a.join_date - b.join_date,
        display: (member) => member.rank,
    },
    xp: {
        label: "XP",
        compare: (a, b) => a.xp - b.xp,
        display: (member) => `${member.xp.toLocaleString()} XP`,
    },
    joined: {
        label: "Join date",
        compare: (a, b) => a.join_date - b.join_date,
        display: (member) => formatUnixTime(member.join_date),
    },
}

/**
 * The roster itself.
 *
 * Split out from `ClanBody` rather than inlined, because `useSortBy` is a hook
 * and has to run on every render while `ClanBody` needs to bail out when the
 * clan does not exist. Handing the resolved clan to a component that only ever
 * sees a real one is what lets both be true.
 */
const Roster = ({ clan }: { readonly clan: Clan }) => {
    const clanXp = Number(clan.clan_xp)

    /*
     * Rank ascending by default: a clan's own order is the one its members
     * would expect to find it in, and XP descending is one toggle away for
     * anyone who came to see who earns the most.
     */
    const sort = useSortBy(clan.clan, sortOptions, "rank", "asc")

    return (
        <div className="flex flex-col gap-4">
            <SortControl
                label="Sort members by"
                value={sort.key}
                choices={sort.choices}
                onChange={sort.setKey}
                direction={sort.direction}
                onToggleDirection={sort.toggleDirection}
                className="sm:max-w-sm"
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sort.sorted.map((member) => (
                    <MemberCard
                        key={member.brawlhalla_id}
                        member={member}
                        clanXp={clanXp}
                    />
                ))}
            </div>
        </div>
    )
}

export const ClanBody = ({ clanId }: { readonly clanId: number }) => {
    const clan = useQuery(clanStatsAtom(clanId))

    if (!clan) return null

    return <Roster clan={clan} />
}
