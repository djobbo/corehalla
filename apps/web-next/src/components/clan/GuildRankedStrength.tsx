import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    guildStrength,
    ratingRangeLabel,
    strengthSummary,
} from "@/lib/guildStrength"
import { cn } from "@/lib/cn"
import type { GuildMember } from "@crh/api-contract/schemas"

const UNRATED_LABEL = "No 1v1 rating in Corehalla's index"

const memberCountLabel = (count: number): string =>
    `${count} ${count === 1 ? "member" : "members"}`

export const GuildRankedStrength = ({
    members,
}: {
    readonly members: readonly GuildMember[]
}) => {
    const strength = guildStrength(members)
    const summary = strengthSummary(strength)
    // Bars are relative to the fullest bucket so a thin distribution still reads.
    const peak = Math.max(1, ...strength.buckets.map((bucket) => bucket.count))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ranked strength</CardTitle>
                {summary === null ? null : (
                    <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="ch-display text-2xl tabular-nums">
                            {summary.average}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                            {summary.ratio}
                        </span>
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {strength.memberCount === 0 ? (
                    <Empty className="rounded-none bg-card py-8 shadow-md">
                        <EmptyHeader>
                            <EmptyTitle>Nothing to measure yet</EmptyTitle>
                            <EmptyDescription>
                                This guild has no members yet.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="flex flex-col gap-3">
                        <dl
                            aria-label="Members by 1v1 rating"
                            className="flex flex-col gap-2"
                        >
                            {strength.buckets.map((bucket) => (
                                <div
                                    key={bucket.from}
                                    className="flex min-w-0 flex-col gap-1"
                                >
                                    <div className="flex items-baseline justify-between gap-x-3">
                                        <dt className="min-w-0 text-xs font-bold tabular-nums text-muted-foreground">
                                            {ratingRangeLabel(bucket)}
                                        </dt>
                                        <dd className="ch-stat-value shrink-0 whitespace-nowrap text-right">
                                            {memberCountLabel(bucket.count)}
                                        </dd>
                                    </div>
                                    <div
                                        aria-hidden
                                        className="ch-progress ch-progress-sm"
                                    >
                                        <span
                                            style={{
                                                width: `${(bucket.count / peak) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {strength.unratedCount === 0 ? null : (
                                <div
                                    className={cn(
                                        "flex min-w-0 items-baseline justify-between gap-x-3",
                                        strength.buckets.length > 0 &&
                                            "border-t border-border/50 pt-2",
                                    )}
                                >
                                    <dt className="min-w-0 text-xs font-bold text-muted-foreground">
                                        {UNRATED_LABEL}
                                    </dt>
                                    <dd className="ch-stat-value shrink-0 whitespace-nowrap text-right">
                                        {memberCountLabel(
                                            strength.unratedCount,
                                        )}
                                    </dd>
                                </div>
                            )}
                        </dl>
                        {strength.unratedCount === 0 ? (
                            <p className="text-xs font-normal text-muted-foreground">
                                Every member has a 1v1 rating in
                                Corehalla&apos;s index.
                            </p>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
