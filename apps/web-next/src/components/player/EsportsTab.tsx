import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EntityLink } from "@/components/common/EntityLink"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { playerEsportsAtom, useQuery } from "@/effect/atoms"
import { playerHref } from "@/lib/rankings"
import type { EsportsPlacement, EsportsPr } from "@crh/api-contract/schemas"

const Row = ({
    label,
    value,
}: {
    readonly label: string
    readonly value: string | number
}) => (
    <div className="flex items-baseline justify-between gap-3">
        <dt className="ch-stat-label">{label}</dt>
        <dd className="text-right font-semibold">{value}</dd>
    </div>
)

const PrBlock = ({
    label,
    pr,
}: {
    readonly label: string
    readonly pr: EsportsPr | null
}) => (
    <div className="flex flex-col gap-1">
        <span className="ch-stat-label">{label}</span>
        {pr === null ? (
            <span className="text-sm text-muted-foreground">
                Not power ranked
            </span>
        ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="ch-display text-2xl">#{pr.powerRanking}</span>
                <span className="text-xs font-bold tracking-[0.16em] text-muted-foreground">
                    {pr.region}
                </span>
                <span className="text-xs text-muted-foreground">
                    {pr.gold} gold · {pr.silver} silver · {pr.bronze} bronze ·{" "}
                    {pr.top8} top 8 · {pr.top32} top 32
                </span>
            </div>
        )}
    </div>
)

const PlacementsCard = ({
    title,
    placements,
}: {
    readonly title: string
    readonly placements: readonly EsportsPlacement[]
}) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {placements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No placements recorded.
                </p>
            ) : (
                <ul className="flex flex-col divide-y divide-border">
                    {placements.map((placement) => (
                        <li
                            key={`${placement.tournamentId}-${placement.placement}`}
                            className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
                        >
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate font-semibold">
                                    {placement.tournamentName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {placement.year}
                                    {placement.eventName === null
                                        ? ""
                                        : ` · ${placement.eventName}`}
                                    {placement.isOnline ? "" : " · offline"}
                                </span>
                            </span>
                            <span className="shrink-0 tabular-nums">
                                #{placement.placement}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </CardContent>
    </Card>
)

export const EsportsTab = ({ playerId }: { readonly playerId: number }) => {
    const esports = useQuery(playerEsportsAtom(playerId)).data
    const identity = esports.identity

    if (identity === null) {
        return (
            <Empty className="rounded-2xl bg-card py-10">
                <EmptyHeader>
                    <EmptyDescription>
                        No esports record found for this player.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    // Only surface identity fields brawltools actually has.
    const details: {
        readonly label: string
        readonly value: string | number
    }[] = [
        ...(identity.fullName === null
            ? []
            : [{ label: "Full name", value: identity.fullName }]),
        ...(identity.pronoun === null
            ? []
            : [{ label: "Pronouns", value: identity.pronoun }]),
        ...(identity.country === null
            ? []
            : [{ label: "Country", value: identity.country }]),
        ...(identity.sggPlayerId === null
            ? []
            : [{ label: "Start.gg ID", value: identity.sggPlayerId }]),
    ]

    const hasSocials = identity.twitter !== null || identity.twitch !== null
    const hasProfileCard = details.length > 0 || hasSocials

    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-4 @2xl:grid-cols-2">
                {hasProfileCard && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Esports profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="flex flex-col gap-2 text-sm">
                                {details.map((detail) => (
                                    <Row
                                        key={detail.label}
                                        label={detail.label}
                                        value={detail.value}
                                    />
                                ))}
                                {hasSocials && (
                                    <div className="flex items-baseline justify-between gap-3">
                                        <dt className="ch-stat-label">
                                            Socials
                                        </dt>
                                        <dd className="flex gap-2 text-right font-semibold">
                                            {identity.twitter !== null && (
                                                <a
                                                    href={`https://twitter.com/${identity.twitter}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="hover:text-ring"
                                                >
                                                    @{identity.twitter}
                                                </a>
                                            )}
                                            {identity.twitch !== null && (
                                                <a
                                                    href={`https://twitch.tv/${identity.twitch}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="hover:text-ring"
                                                >
                                                    {identity.twitch}
                                                </a>
                                            )}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Power ranking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <PrBlock label="1v1" pr={esports.pr["1v1"]} />
                            <PrBlock label="2v2" pr={esports.pr["2v2"]} />
                            {esports.recentLegend !== null && (
                                <Row
                                    label="Most recent legend"
                                    value={`${esports.recentLegend.name} (${esports.recentLegend.count} maps)`}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Frequent teammates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {esports.teammates.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No teammates recorded.
                            </p>
                        ) : (
                            <ul className="flex flex-col divide-y divide-border">
                                {esports.teammates.map((teammate) => (
                                    <li
                                        key={`${teammate.brawlhallaId ?? "unknown"}-${teammate.lastTeamedDate}`}
                                        className="flex items-center justify-between gap-3 py-1.5 text-sm"
                                    >
                                        {teammate.slug === null ? (
                                            <span className="font-semibold">
                                                {teammate.name}
                                            </span>
                                        ) : (
                                            <EntityLink
                                                type="player"
                                                id={teammate.brawlhallaId ?? 0}
                                                href={playerHref(teammate.slug)}
                                                className="font-semibold"
                                            >
                                                {teammate.name}
                                            </EntityLink>
                                        )}
                                        <span className="tabular-nums text-muted-foreground">
                                            {teammate.games} games
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <PlacementsCard
                    title="Recent 1v1 placements"
                    placements={esports.placements["1v1"]}
                />
                <PlacementsCard
                    title="Recent 2v2 placements"
                    placements={esports.placements["2v2"]}
                />
            </div>
        </div>
    )
}
