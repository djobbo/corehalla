// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Components imports
import { StatSmall, StatMedium, StatLarge, StatDesc } from './TextStyles';

interface Props {
    tier: string;
    rating: number;
    peak: number;
    games: number;
    wins: number;
    losses: number;
    winrate: number;
    ratingSquash: number;
}

const StatsContainer = styled.div``;

const RankedBanner = styled(motion.img)`
    width: 8rem;
    object-fit: contain;
    margin-right: 1rem;
    margin-top: 0.5rem;
`;

const SectionWrapper = styled.div`
    display: flex;
    justify-content: center;
    overflow-x: auto;
`;

const StatsSeparator = styled.hr`
    border-bottom: 1px solid var(--bg-2);
    margin: 0.25rem;
    width: 100%;
`;

export const SectionSeasonOverviewContent: FC<Props> = ({
    tier,
    rating,
    peak,
    games,
    wins,
    losses,
    winrate,
    ratingSquash,
}: Props) => {
    return (
        <SectionWrapper>
            <RankedBanner
                src={`/images/ranked-banners/${tier}.png`}
                alt={tier}
                animate={{
                    scaleX: [0.86, 0.91, 0.91, 0.86, 0.86, 0.86],
                    scaleY: [0.86, 1, 0.82, 0.91, 0.86, 0.86],
                }}
                style={{ originY: 0 }}
                transition={{ ease: 'easeInOut', repeat: Infinity, times: [0, 0.03, 0.06, 0.08, 0.1, 1], duration: 5 }}
            />
            <StatsContainer>
                <div>
                    <StatDesc>tier</StatDesc>
                    <StatLarge>{tier.toUpperCase()}</StatLarge>
                </div>
                <div>
                    <StatDesc>elo</StatDesc>
                    <StatMedium>{rating}</StatMedium>
                </div>
                <div>
                    <StatDesc>peak</StatDesc>
                    <StatSmall>{peak}</StatSmall>
                </div>
                <StatsSeparator />
                <div>
                    <StatSmall>{games}</StatSmall>
                    <StatDesc>games</StatDesc>
                    <StatSmall>{`(${wins}W-${losses}L)`}</StatSmall>
                </div>
                <div>
                    <StatDesc>winrate</StatDesc>
                    <StatSmall>{`${winrate.toFixed(2)}%`}</StatSmall>
                </div>
                <StatsSeparator />
                <div>
                    <StatDesc>elo squash</StatDesc>
                    <StatSmall>{ratingSquash}</StatSmall>
                </div>
            </StatsContainer>
        </SectionWrapper>
    );
};
