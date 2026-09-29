import { Card, CardContent } from "@/components/ui/card"
import { SplitProgress } from "@/components/SplitProgress"
import { EntityLink } from "@/components/EntityLink"
import { rankedBannerSrc, regionFlagSrc } from "@/lib/assets"
import { playerHref } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { PlayerRankedTeam } from "@crh/api-contract/schemas"

export const TeamCard = ({ team }: { readonly team: PlayerRankedTeam }) => {
    const [first, second] = team.team
    const region = team.region?.toUpperCase() ?? "ALL"
    const tier = team.tier ?? "Valhallan"
    const losses = team.games - team.wins

    return (
        <Card className="relative z-0 overflow-visible">
            <img
                src={rankedBannerSrc(tier)}
                alt={`${tier} ranked`}
                title={tier}
                className="ch-card-banner"
            />
            <CardContent>
                <div className="ch-nameplate">
                    <img
                        src={regionFlagSrc(region)}
                        alt={`${region} region`}
                        title={`${region} region`}
                        className="ch-nameplate-flag"
                    />
                    <div className="ch-nameplate-names">
                        <EntityLink
                            type="player"
                            id={first.id}
                            href={playerHref(first.slug)}
                        >
                            {cleanString(first.name)}
                        </EntityLink>
                        <span aria-hidden className="text-white/70">
                            &
                        </span>
                        <EntityLink
                            type="player"
                            id={second.id}
                            href={playerHref(second.slug)}
                        >
                            {cleanString(second.name)}
                        </EntityLink>
                    </div>
                </div>
                <p className="ch-display mt-2 text-2xl">
                    {team.rating.toLocaleString()}
                    <span className="ml-2 text-xs font-normal tracking-normal text-muted-foreground">
                        / {team.peak_rating.toLocaleString()} peak
                    </span>
                </p>
                <SplitProgress
                    className="mt-2"
                    parts={[
                        { key: "wins", value: team.wins, intent: "green" },
                        { key: "losses", value: losses, intent: "orange" },
                    ]}
                />
                <div className="mt-1.5 flex justify-between text-sm font-bold">
                    <span>
                        {team.wins.toLocaleString()}W{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            ({percent(team.wins, team.games).toFixed(2)}%)
                        </span>
                    </span>
                    <span>
                        {losses.toLocaleString()}L{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            ({percent(losses, team.games).toFixed(2)}%)
                        </span>
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
