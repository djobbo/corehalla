import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import { EntityLink } from "@/components/common/EntityLink"
import { ClanRankIcon } from "./ClanRankIcon"
import {
    contributorMetricLabel,
    contributorValue,
    topContributors,
} from "@/lib/guildContributors"
import { playerHref } from "@/lib/rankings"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { GuildMember } from "@crh/api-contract/schemas"
import type { ClanRank } from "@crh/bhapi/constants"

export const TopContributors = ({
    members,
}: {
    readonly members: readonly GuildMember[]
}) => {
    const { metric, members: contributors } = topContributors(members)
    const label = contributorMetricLabel(metric)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top contributors</CardTitle>
                {contributors.length === 0 ? null : (
                    <p className="text-xs font-bold text-muted-foreground">
                        Ranked by {label}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {contributors.length === 0 ? (
                    <Empty className="rounded-2xl bg-card py-8">
                        <EmptyHeader>
                            <EmptyTitle>Nothing to rank yet</EmptyTitle>
                            <EmptyDescription>
                                {members.length === 0
                                    ? "This guild has no members yet."
                                    : `No member reports ${label} yet.`}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <ol className="flex flex-col gap-2">
                        {contributors.map((member, index) => (
                            <li
                                key={member.id}
                                className="flex min-w-0 items-center gap-3 border-b border-border/50 pb-2 last:border-b-0 last:pb-0"
                            >
                                <span
                                    aria-hidden
                                    className="ch-display w-5 shrink-0 text-lg text-muted-foreground"
                                >
                                    {index + 1}
                                </span>
                                <ClanRankIcon rank={member.rank as ClanRank} />
                                <EntityLink
                                    type="player"
                                    id={member.id}
                                    href={playerHref(member.slug)}
                                    className="min-w-0 flex-1 truncate font-bold"
                                >
                                    {cleanString(member.name) ||
                                        `#${member.id}`}
                                </EntityLink>
                                <span className="ch-stat-value whitespace-nowrap text-right">
                                    {contributorValue(
                                        member,
                                        metric,
                                    ).toLocaleString()}
                                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                        {label}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
            </CardContent>
        </Card>
    )
}
