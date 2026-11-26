import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import { EntityLink } from "@/components/common/EntityLink"
import { regionFlagSrc } from "@/lib/assets"
import { strongestMembers } from "@/lib/guildStrongest"
import { playerHref, tierColor } from "@/lib/rankings"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { GuildMember } from "@crh/api-contract/schemas"
import type { CSSProperties } from "react"

export const GuildStrongestMembers = ({
    members,
}: {
    readonly members: readonly GuildMember[]
}) => {
    const strongest = strongestMembers(members)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Strongest members</CardTitle>
                {strongest.length === 0 ? null : (
                    <p className="text-xs font-bold text-muted-foreground">
                        Ranked by 1v1 rating
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {strongest.length === 0 ? (
                    <Empty className="rounded-none bg-card py-8 shadow-md">
                        <EmptyHeader>
                            <EmptyTitle>Nothing to rank yet</EmptyTitle>
                            <EmptyDescription>
                                {members.length === 0
                                    ? "This guild has no members yet."
                                    : "This guild has no rated members yet."}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <ol className="flex flex-col gap-2">
                        {strongest.map((member, index) => (
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
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <EntityLink
                                        type="player"
                                        id={member.id}
                                        href={playerHref(member.slug)}
                                        className="min-w-0 truncate font-bold"
                                    >
                                        {cleanString(member.name) ||
                                            `#${member.id}`}
                                    </EntityLink>
                                    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                                        <span
                                            className="ch-tier shrink-0"
                                            style={
                                                {
                                                    "--ch-tier": tierColor(
                                                        member.tier,
                                                    ),
                                                } as CSSProperties
                                            }
                                        >
                                            {member.tier}
                                        </span>
                                        <span className="whitespace-nowrap text-xs font-normal text-muted-foreground">
                                            peak{" "}
                                            {member.peakRating.toLocaleString()}
                                        </span>
                                        {member.region === null ? null : (
                                            <img
                                                src={regionFlagSrc(
                                                    member.region,
                                                )}
                                                alt={`${member.region.toUpperCase()} region`}
                                                title={`${member.region.toUpperCase()} region`}
                                                className="h-3.5 w-5 shrink-0 rounded-sm object-contain"
                                            />
                                        )}
                                    </span>
                                </span>
                                <span className="ch-stat-value shrink-0 whitespace-nowrap text-right">
                                    {member.rating.toLocaleString()}
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                                        1v1
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
