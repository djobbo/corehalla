import { SortControl } from "@/components/common/SortControl"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { GuildRankedStrength } from "./GuildRankedStrength"
import { GuildStrongestMembers } from "./GuildStrongestMembers"
import { MemberCard } from "./MemberCard"
import { TopContributors } from "./TopContributors"
import { guildAtom, useQuery } from "@/effect/atoms"
import { cn } from "@/lib/cn"
import { compareMemberRating } from "@/lib/guildRatings"
import {
    isRosterFiltered,
    rosterEmptyMessage,
    rosterMatchSummary,
    rosterMatches,
    rosterRoleCounts,
} from "@/lib/guildRoster"
import { useSortBy } from "@/lib/useSortBy"
import { formatUnixTime } from "@crh/common/helpers/date"
import { useId, useState } from "react"
import type { Guild, GuildMember } from "@crh/api-contract/schemas"
import type { RosterRoleFilter } from "@/lib/guildRoster"
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

/** Chips for the roles the roster contains; `All` clears the role filter. */
const RoleChips = ({
    members,
    role,
    onRoleChange,
}: {
    readonly members: readonly GuildMember[]
    readonly role: RosterRoleFilter
    readonly onRoleChange: (role: RosterRoleFilter) => void
}) => {
    const choices = [
        { value: "all" as const, label: "All", count: members.length },
        ...rosterRoleCounts(members).map(({ role: value, count }) => ({
            value,
            label: value,
            count,
        })),
    ]

    return (
        <fieldset className="flex min-w-0 flex-col gap-1">
            <legend className="ch-stat-label">Role</legend>
            <div className="flex flex-wrap gap-1.5">
                {choices.map((choice) => (
                    <button
                        key={choice.value}
                        type="button"
                        aria-pressed={choice.value === role}
                        aria-label={`${choice.label}, ${choice.count} ${
                            choice.count === 1 ? "member" : "members"
                        }`}
                        onClick={() => onRoleChange(choice.value)}
                        className={cn(
                            "ch-chip",
                            choice.value === role
                                ? "ch-chip-on"
                                : "ch-chip-off",
                        )}
                    >
                        {choice.label}
                        <span className="opacity-60">{choice.count}</span>
                    </button>
                ))}
            </div>
        </fieldset>
    )
}

const Roster = ({ guild }: { readonly guild: Guild }) => {
    const [query, setQuery] = useState("")
    const [role, setRole] = useState<RosterRoleFilter>("all")
    const queryId = useId()

    const filters = { query, role }
    const members = rosterMatches(guild.members, filters)
    const filtered = isRosterFiltered(filters)
    const clearFilters = () => {
        setQuery("")
        setRole("all")
    }

    const sort = useSortBy<Member, MemberSort>(
        members,
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
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
                    <label htmlFor={queryId} className="ch-stat-label">
                        Find a member
                    </label>
                    <Input
                        id={queryId}
                        type="search"
                        value={query}
                        placeholder="In-game name"
                        autoComplete="off"
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
                <RoleChips
                    members={guild.members}
                    role={role}
                    onRoleChange={setRole}
                />
                <SortControl
                    label="Sort members by"
                    value={sort.key}
                    choices={sort.choices.filter(
                        (choice) => choice.value !== "points" || reportsPoints,
                    )}
                    onChange={sort.setKey}
                    direction={sort.direction}
                    onToggleDirection={sort.toggleDirection}
                    className="w-full sm:w-52"
                />
            </div>
            {guild.members.length === 0 ? null : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <output
                        aria-live="polite"
                        className="text-xs font-bold text-muted-foreground"
                    >
                        {rosterMatchSummary(
                            members.length,
                            guild.members.length,
                        )}
                    </output>
                    {filtered && members.length > 0 ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </Button>
                    ) : null}
                </div>
            )}
            {filtered && members.length === 0 ? (
                <Empty className="rounded-none bg-card py-10 shadow-md">
                    <EmptyHeader>
                        <EmptyTitle>No members match</EmptyTitle>
                        <EmptyDescription>
                            {rosterEmptyMessage(filters)}
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
                    {sort.sorted.map((member) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            clanXp={guild.xp}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export const ClanBody = ({ clanId }: { readonly clanId: number }) => {
    const guild = useQuery(guildAtom(clanId))

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <TopContributors members={guild.data.members} />
                <GuildRankedStrength members={guild.data.members} />
                <GuildStrongestMembers members={guild.data.members} />
            </div>
            <Roster guild={guild.data} />
        </div>
    )
}
