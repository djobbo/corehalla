import React, { FC } from 'react';

import { IPlayerStatsFormat } from 'corehalla.js';
import { ProfileHeader } from '../../../../components/ProfileHeader';

import { PageSection, SectionSeparator } from '../../../../components/PageSection';
import { SectionSeasonOverviewContent } from '../../../../components/SectionSeasonOverviewContent';
import { SectionClanOverviewSmallContent } from '../../../../components/SectionClanOverviewSmallContent';
import { SectionOverallStatsContent } from '../../../../components/SectionOverallStatsContent';

interface Props {
    playerStats: IPlayerStatsFormat;
}

//TODO: Add losses in ch.js to avoid losses={season.games - season.wins} && losses={playerStats.games - playerStats.wins}
export const OverviewTab: FC<Props> = ({ playerStats }: Props) => {
    const { season, clan } = playerStats;
    return (
        <>
            <ProfileHeader title={playerStats.name} bannerURI="https://picsum.photos/1920/120" />
            <SectionSeparator />
            <PageSection title="SeasonOverview" initFoldState={true}>
                <SectionSeasonOverviewContent
                    {...season}
                    losses={season.games - season.wins}
                    winrate={(season.wins / season.games) * 100}
                />
            </PageSection>
            {clan && (
                <>
                    <SectionSeparator />
                    <PageSection title="Clan" initFoldState={true}>
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
            <PageSection title="Overall Stats" initFoldState={true}>
                <SectionOverallStatsContent {...playerStats} losses={playerStats.games - playerStats.wins} />
            </PageSection>
        </>
    );
};
