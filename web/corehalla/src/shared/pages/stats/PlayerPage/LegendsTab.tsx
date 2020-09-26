import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import { ILegendStatsFormat } from 'corehalla.js';

import { PageSection, SectionSeparator } from '../../../components/PageSection';
import { SectionSeasonOverviewContent } from '../../../components/SectionSeasonOverviewContent';
import { SectionOverallStatsContent } from '../../../components/SectionOverallStatsContent';
import { StatDesc, StatSmall } from '../../../components/TextStyles';
import { formatTime } from '../../../util';
import { Select } from '../../../components/Select';

interface Props {
    legends: ILegendStatsFormat[];
}

type LegendSort =
    | 'default'
    | 'level'
    | 'matchtime'
    | 'rating'
    | 'peak'
    | 'games'
    | 'winrate'
    | 'ranked games'
    | 'ranked winrate';

const LegendLevelStatsWrapper = styled.div`
    margin-bottom: 1rem;
    display: flex;
`;

const LegendIcon = styled.img`
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
    border-radius: 0.75rem;
`;

const getSortedProp = (state: LegendSort, legendStats: ILegendStatsFormat) => {
    switch (state) {
        case 'matchtime':
            return legendStats.matchtime;
        case 'rating':
            return legendStats.season.rating;
        case 'peak':
            return legendStats.season.peak;
        case 'games':
            return legendStats.games;
        case 'winrate':
            return legendStats.games <= 0 ? 0 : legendStats.wins / legendStats.games;
        case 'ranked games':
            return legendStats.season.games;
        case 'ranked winrate':
            return legendStats.season.games <= 0 ? 0 : legendStats.season.wins / legendStats.season.games;
        default:
            return legendStats.xp;
    }
};

const getSortedDisplay = (state: LegendSort, legendStats: ILegendStatsFormat) => {
    switch (state) {
        case 'matchtime':
            return `Time Played: ${formatTime(legendStats.matchtime)}`;
        case 'rating':
            return `${legendStats.season.rating} elo`;
        case 'peak':
            return `${legendStats.season.peak} peak elo`;
        case 'games':
            return `${legendStats.games} games`;
        case 'winrate':
            return legendStats.games <= 0 ? `N/A` : `${((legendStats.wins / legendStats.games) * 100).toFixed(2)}%`;
        case 'ranked games':
            return `${legendStats.season.games} games`;
        case 'ranked winrate':
            return legendStats.season.games <= 0
                ? `N/A`
                : `${((legendStats.season.wins / legendStats.season.games) * 100).toFixed(2)}%`; // TODO: winrate ch.js
        default:
            return `Level ${legendStats.level}`;
    }
};

// TODO: matchtime format in ch.js
export const LegendsTab: FC<Props> = ({ legends }: Props) => {
    const [sort, setSort] = useState<LegendSort>('default');

    return (
        <>
            <Select<LegendSort>
                action={setSort}
                title="Sort by"
                options={[
                    { name: 'Level', value: 'default' },
                    { name: 'Time Played', value: 'matchtime' },
                    { name: 'Rating', value: 'rating' },
                    { name: 'Peak Rating', value: 'peak' },
                    { name: 'Games', value: 'games' },
                    { name: 'Winrate', value: 'winrate' },
                    { name: 'Ranked Games', value: 'ranked games' },
                    { name: 'Ranked Winrate', value: 'ranked winrate' },
                ]}
            />
            {legends
                .sort((a, b) => (getSortedProp(sort, a) < getSortedProp(sort, b) ? 1 : -1))
                .map((legend, i) => {
                    return (
                        <motion.div layout key={legend.id}>
                            <SectionSeparator />
                            <PageSection title={`${i + 1}. ${legend.name} ${`• ${getSortedDisplay(sort, legend)}`}`}>
                                <LegendLevelStatsWrapper>
                                    <LegendIcon src={`/assets/images/icons/legends/${legend.name}.png`} />
                                    <div>
                                        <div>
                                            <StatDesc>Level</StatDesc>
                                            <StatSmall>{legend.level}</StatSmall>
                                            <StatDesc>({legend.xp}xp)</StatDesc>
                                        </div>
                                        <div>
                                            <StatDesc>Time played</StatDesc>
                                            <StatSmall>{formatTime(legend.matchtime)}</StatSmall>
                                        </div>
                                    </div>
                                </LegendLevelStatsWrapper>
                                <SectionSeasonOverviewContent
                                    {...legend.season}
                                    losses={legend.season.games - legend.season.wins}
                                    winrate={(legend.season.wins / legend.season.games) * 100}
                                />
                                <SectionOverallStatsContent {...legend} losses={legend.games - legend.wins} />
                            </PageSection>
                        </motion.div>
                    );
                })}
        </>
    );
};
