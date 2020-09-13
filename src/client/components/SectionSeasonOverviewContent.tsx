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
    icon: string;
}

const StatsContainer = styled.div``;

const RankedBanner = styled(motion.img)`
    width: 8rem;
    height: auto;
    margin-right: 1rem;
`;

const FlagIcon = styled.img`
    width: 2rem;
    height: 2rem;
    border-radius: 0.75rem;
`;

const SectionWrapper = styled.div`
    display: flex;
    justify-content: center;
    overflow-x: auto;
`;

export const SectionSeasonOverviewContent: FC<Props> = ({
    tier,
    rating,
    peak,
    games,
    wins,
    losses,
    winrate,
    icon,
}: Props) => {
    return (
        <SectionWrapper>
            <RankedBanner
                src={`/assets/images/ranked-banners/${tier}.png`}
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
                <div>
                    <StatSmall>{games}</StatSmall>
                    <StatDesc>games</StatDesc>
                    <StatSmall>{`(${wins}W-${losses}L)`}</StatSmall>
                </div>
                <div>
                    <StatDesc>winrate</StatDesc>
                    <StatSmall>{`${winrate.toFixed(2)}%`}</StatSmall>
                </div>
                <FlagIcon src={`/assets/images/icons/${icon}.png`} alt={icon} />
            </StatsContainer>
        </SectionWrapper>
    );
};
