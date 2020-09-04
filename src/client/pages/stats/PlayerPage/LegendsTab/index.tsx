import React, { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import { ILegendStatsFormat } from 'corehalla.js';

import { PageSection, SectionSeparator } from '../../../../components/PageSection';
import { SectionSeasonOverviewContent } from '../../../../components/SectionSeasonOverviewContent';
import { SectionOverallStatsContent } from '../../../../components/SectionOverallStatsContent';
import { StatDesc, StatSmall } from '../../../../components/TextStyles';

interface Props {
    legends: ILegendStatsFormat[];
}

const LegendLevelStatsWrapper = styled.div`
    margin-bottom: 1rem;
`;
// TODO: matchtime format in ch.js
export const LegendsTab: FC<Props> = ({ legends }: Props) => {
    return (
        <>
            {legends.map((legend, i) => (
                <motion.div layout key={i}>
                    <SectionSeparator />
                    <PageSection title={legend.name}>
                        <LegendLevelStatsWrapper>
                            <div>
                                <StatDesc>Level</StatDesc>
                                <StatSmall>{legend.level}</StatSmall>
                                <StatDesc>({legend.xp}xp)</StatDesc>
                            </div>
                            <div>
                                <StatDesc>Time played</StatDesc>
                                <StatSmall>{legend.matchtime}</StatSmall>
                            </div>
                        </LegendLevelStatsWrapper>
                        <SectionSeasonOverviewContent
                            {...legend.season}
                            losses={legend.season.games - legend.season.wins}
                            winrate={(legend.season.wins / legend.season.games) * 100}
                            icon={`legends/${legend.name}`}
                        />
                        <SectionOverallStatsContent {...legend} losses={legend.games - legend.wins} />
                    </PageSection>
                </motion.div>
            ))}
        </>
    );
};
