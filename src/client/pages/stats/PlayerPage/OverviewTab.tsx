import React, { FC } from 'react';

import { IPlayerStatsFormat } from 'corehalla.js';
import { ProfileHeader } from '../../../components/ProfileHeader';

import { PageSection, SectionSeparator } from '../../../components/PageSection';
import { SectionSeasonOverviewContent } from '../../../components/SectionSeasonOverviewContent';
import { SectionClanOverviewSmallContent } from '../../../components/SectionClanOverviewSmallContent';
import { SectionOverallStatsContent } from '../../../components/SectionOverallStatsContent';
import { StatDesc, StatMedium, StatSmall } from '../../../components/TextStyles';

interface Props {
    playerStats: IPlayerStatsFormat;
}

//TODO: Add losses in ch.js to avoid losses={season.games - season.wins} && losses={playerStats.games - playerStats.wins}
export const OverviewTab: FC<Props> = ({ playerStats }: Props) => {
    const { season, clan } = playerStats;
    return (
        <>
            <ProfileHeader
                title={playerStats.name}
                bannerURI="https://picsum.photos/480/120"
                favorite={{
                    name: playerStats.name,
                    id: playerStats.id.toString(), // TODO: id is a number?
                    type: 'player',
                    thumbURI: `/assets/images/icons/legends/${
                        playerStats.legends.sort((a, b) => b.season.rating - a.season.rating)[0].name
                    }.png`,
                }}
            />
            <SectionSeparator />
            <PageSection title="Season Overview" initFoldState>
                <SectionSeasonOverviewContent
                    {...season}
                    losses={season.games - season.wins}
                    winrate={(season.wins / season.games) * 100}
                />
            </PageSection>
            <SectionSeparator />
            <PageSection title="Glory" initFoldState>
                <div>
                    <StatDesc>estimated glory:</StatDesc>
                    <StatMedium>{season.glory.wins + season.glory.bestRating}</StatMedium>
                </div>
                <div>
                    <StatDesc>from wins:</StatDesc>
                    <StatSmall>{season.glory.wins}</StatSmall>
                </div>
                <div>
                    <StatDesc>from best rating:</StatDesc>
                    <StatSmall>{season.glory.bestRating}</StatSmall>
                </div>
            </PageSection>
            {clan && (
                <>
                    <SectionSeparator />
                    <PageSection title="Clan" initFoldState>
                        <SectionClanOverviewSmallContent
                            {...clan}
                            xp={parseInt(clan.xp)}
                            level={56 /* TODO: don't hardcode this */}
                            xpPercentage={(clan.personalXp / parseInt(clan.xp)) * 100} // TODO: change clan xp to number in ch.js
                        />
                    </PageSection>
                </>
            )}
            <SectionSeparator />
            <PageSection title="Overall Stats" initFoldState>
                <SectionOverallStatsContent {...playerStats} losses={playerStats.games - playerStats.wins} />
            </PageSection>
        </>
    );
};
