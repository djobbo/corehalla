import { IPlayerStatsFormat } from '@corehalla/core/types'

import styles from '~styles/pages/stats/PlayerStatsPage.module.scss'

import { PageSection, SectionSeparator } from '@PageSection'
import { SectionClanOverviewSmallContent } from '@SectionClanOverviewSmallContent'
import { SectionOverallStatsContent } from '@SectionOverallStatsContent'
import { SectionSeasonOverviewContent } from '@SectionSeasonOverviewContent'
import { StatDesc, StatMedium, StatSmall } from '@TextStyles'

interface Props {
    playerStats: IPlayerStatsFormat
}

export const OverviewTab = ({ playerStats }: Props): JSX.Element => {
    const { season, clan } = playerStats

    return (
        <>
            <SectionSeparator />
            <PageSection title="Season Overview" collapsed>
                <SectionSeasonOverviewContent
                    {...season}
                    losses={season.games - season.wins}
                    winrate={(season.wins / season.games) * 100}
                />
            </PageSection>
            <SectionSeparator />
            <PageSection title="Aliases" collapsed>
                {season.teams
                    .reduce<string[]>(
                        (acc, { playerAlias }) => (acc.find((x) => x === playerAlias) ? acc : [...acc, playerAlias]),
                        [playerStats.name],
                    )
                    .map((alias) => (
                        <p className={styles.alias} key={alias}>
                            <StatSmall>{alias}</StatSmall>
                        </p>
                    ))}
            </PageSection>
            <SectionSeparator />
            <PageSection title="Glory" collapsed>
                <p>
                    <StatDesc>estimated glory:</StatDesc>
                    <StatMedium>{season.glory.wins + season.glory.bestRating}</StatMedium>
                </p>
                <p>
                    <StatDesc>from wins:</StatDesc>
                    <StatSmall>{season.glory.wins}</StatSmall>
                </p>
                <p>
                    <StatDesc>from best rating:</StatDesc>
                    <StatSmall>{season.glory.bestRating}</StatSmall>
                </p>
            </PageSection>
            {clan && (
                <>
                    <SectionSeparator />
                    <PageSection title="Clan" collapsed>
                        <SectionClanOverviewSmallContent
                            {...clan}
                            xp={parseInt(clan.xp)}
                            level={'TBA'}
                            xpPercentage={(clan.personalXp / parseInt(clan.xp)) * 100} // TODO: change clan xp to number in ch.js
                        />
                    </PageSection>
                </>
            )}
            <SectionSeparator />
            <PageSection title="Overall Stats" collapsed>
                <SectionOverallStatsContent {...playerStats} losses={playerStats.games - playerStats.wins} />
            </PageSection>
        </>
    )
}