import { Card } from "@/components/ui/Card"
import { SplitProgress } from "@/components/ui/Progress"
import { StatGrid } from "@/components/ui/StatGrid"
import { EntityLink } from "@/components/EntityLink"
import { rankedBannerSrc, regionFlagSrc } from "@/lib/assets"
import { playerHref } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import { getLegendEloReset } from "@crh/bhapi/calculator"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { getTierFromRating } from "@crh/bhapi/helpers/getTierFromRating"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import { rankedRegions } from "@crh/bhapi/constants"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { PlayerRanked } from "@crh/bhapi/types"

/**
 * One 2v2 team, as a card.
 *
 * A team is two people, so both are links and both are named — the card is a
 * way through to either profile, not a summary of an abstract pairing.
 *
 * Neither the region nor the tier is written out any more. The tier is what the
 * banner in the corner depicts, and the region is carried by its flag beside the
 * names; spelling either out as text next to its own picture only repeated it.
 */
export const TeamCard = ({
    team,
}: {
    readonly team: PlayerRanked["2v2"][number]
}) => {
    const [first, second] = getTeamPlayers(team)
    const region = rankedRegions[team.region - 1]?.toUpperCase() ?? "ALL"
    const eloReset = getLegendEloReset(team.rating)
    const losses = team.games - team.wins

    return (
        /*
         * `relative z-0` is what the banner needs — `relative` to be its
         * containing block, `z-0` so its stacking context scopes the banner's
         * own `z-index`. No `overflow-hidden`: the banner is meant to overhang
         * the corner, and the overhang is sized to stay inside the grid's gap.
         */
        <Card className="relative z-0">
            {/*
             * The banner loses its `aria-hidden` here, unlike the one on the
             * ranked cards: that card still prints the tier in a chip, so its
             * banner is decoration, whereas this one is now the only statement
             * of the tier. Without a label the tier would be invisible to a
             * screen reader.
             */}
            <img
                src={rankedBannerSrc(team.tier)}
                alt={`${team.tier} ranked`}
                title={team.tier}
                className="ch-card-banner"
            />

            {/*
             * The pair rides on a plate, with the region flag filling its left
             * end. The plate's own margins do the two jobs the row's classes
             * used to: `-1.25rem` pulls it over the card's left padding so it
             * overhangs, and `max-width: calc(100% - 3rem)` keeps it out of the
             * ranked banner's corner at any name length.
             *
             * The `mt-2` is not only breathing room. Removing the header this
             * card used to have pulled everything up by about 25px, which left
             * Platinum's banner touching the win/loss row; this restores the
             * clearance that lets the banner's height decide whether that row
             * needs to step aside.
             */}
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
                        href={playerHref(first.id)}
                        className="ch-link"
                    >
                        {cleanString(first.name)}
                    </EntityLink>
                    <span aria-hidden className="text-white/70">
                        &
                    </span>
                    <EntityLink
                        type="player"
                        id={second.id}
                        href={playerHref(second.id)}
                        className="ch-link"
                    >
                        {cleanString(second.name)}
                    </EntityLink>
                </div>
            </div>

            <p className="ch-display mt-2 text-2xl">
                {team.rating.toLocaleString()}
                <span className="ml-2 text-xs font-normal tracking-normal text-textVar1">
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
                    <span className="text-xs font-normal text-textVar1">
                        ({percent(team.wins, team.games).toFixed(2)}%)
                    </span>
                </span>
                <span>
                    {losses.toLocaleString()}L{" "}
                    <span className="text-xs font-normal text-textVar1">
                        ({percent(losses, team.games).toFixed(2)}%)
                    </span>
                </span>
            </div>
        </Card>
    )
}
