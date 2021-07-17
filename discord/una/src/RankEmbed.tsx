import { ILegendStatsFormat, IPlayerStatsFormat } from '@corehalla/types'
import { React } from 'fancy-discord.js/lib/Embeds'

interface Props {
    type: 'stats' | 'ranked'
    playerStats: IPlayerStatsFormat
    iconUrl?: string | null
}

// TODO: Define JSX.Element in fancy-discord.js
const LegendsRankedField = ({ legends }: { legends: ILegendStatsFormat[] }): JSX.Element => {
    const highestLegend = legends.sort((a, b) => b.season.rating - a.season.rating)[0]
    const mostPlayedLegend = legends.sort((a, b) => b.season.games - a.season.games)[0]

    return (
        <field title="Legends" inline>
            <span bold>Highest Rating: </span>
            {highestLegend.name} ({highestLegend.season.rating} Elo)
            <br />
            <span bold>Most Played: </span>
            {mostPlayedLegend.name} ({highestLegend.season.games} Games)
        </field>
    )
}

// FIXME: null elements
export const RankEmbed = ({
    playerStats: { name, season, wins, games, clan, legends },
    iconUrl,
    type,
}: Props): JSX.Element => {
    return (
        <>
            <title>{type === 'stats' ? '📈 Player Stats' : '🥇 Ranked Data'}</title>
            <author iconURL={iconUrl ?? undefined}>Corehalla</author>
            <desc>React with {type === 'ranked' ? '📈 to view general stats' : '🥇 to view current season stats'}</desc>
            {type === 'ranked' ? (
                <>
                    <field title="Name" inline>
                        <span bold>{name}</span>
                        <br />
                        {clan ? (
                            <span>
                                {'< '}
                                <link href={`https://neue.corehalla.com/stats/clan/${clan.id}`}>{clan.name}</link>
                                {' >'}
                            </span>
                        ) : (
                            ''
                        )}
                    </field>
                    <field title="Region" inline>
                        {season.region}
                    </field>
                    <field title="1v1 Rating" inline>
                        <span bold>{season.tier}</span> ({season.rating.toString()} / {season.peak.toString()} Peak)
                        <br />
                        {season.wins.toString()} Wins / {(season.games - season.wins).toString()} Losses (
                        {season.games.toString()} Games)
                        <br />
                        {(season.wins / season.games).toFixed(2)}% Winrate
                    </field>
                    <LegendsRankedField legends={legends} />
                </>
            ) : (
                <field title="Games">
                    {wins.toString()} Wins / {(games - wins).toString()} Losses ({games.toString()} Games)
                    <br />
                    {(wins / games).toFixed(2)}% Winrate
                </field>
            )}
            <timestamp timestamp={Date.now()} />
            {/* FIXME: <Url>asdas</Url> */}
        </>
    )
}
