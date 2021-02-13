import React, { FC } from 'react';
import styled from 'styled-components';

import { formatTime } from '../../../util';

import { ProfileHeader } from '../../../components/ProfileHeader';

import { PageSection, SectionSeparator } from '../../../components/PageSection';
import { SectionSeasonOverviewContent } from '../../../components/SectionSeasonOverviewContent';
import { SectionClanOverviewSmallContent } from '../../../components/SectionClanOverviewSmallContent';
import { SectionOverallStatsContent } from '../../../components/SectionOverallStatsContent';
import { StatDesc, StatMedium, StatSmall } from '../../../components/TextStyles';
import type { IPlayerStatsFormat } from 'corehalla';

interface Props {
    playerStats: IPlayerStatsFormat;
}

const Alias = styled.p`
    &::before {
        color: var(--accent);
        content: '■ ';
    }
    margin: 0.25rem 0;
`;

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
                    thumbURI: `/images/icons/legends/${
                        playerStats.legends.sort((a, b) => b.season.rating - a.season.rating)[0].name
                    }.png`,
                }}
            >
                <div>
                    <p>
                        <StatDesc>level</StatDesc>
                        <StatSmall>{playerStats.level}</StatSmall>
                        <StatDesc>({playerStats.xp} xp)</StatDesc>
                    </p>
                    <p>
                        <StatDesc>time spent in game</StatDesc>
                        <StatSmall>{formatTime(playerStats.matchtime)}</StatSmall>
                    </p>
                </div>
            </ProfileHeader>
            <SectionSeparator />
            <PageSection title="Season Overview" initFoldState>
                <SectionSeasonOverviewContent
                    {...season}
                    losses={season.games - season.wins}
                    winrate={(season.wins / season.games) * 100}
                />
            </PageSection>
            <SectionSeparator />
            <PageSection title="Aliases" initFoldState>
                {season.teams
                    .reduce<string[]>(
                        (acc, { playerAlias }) => (acc.find((x) => x === playerAlias) ? acc : [...acc, playerAlias]),
                        [playerStats.name],
                    )
                    .map((alias) => (
                        <Alias key={alias}>
                            <StatSmall>{alias}</StatSmall>
                        </Alias>
                    ))}
            </PageSection>
            <SectionSeparator />
            <PageSection title="Glory" initFoldState>
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
