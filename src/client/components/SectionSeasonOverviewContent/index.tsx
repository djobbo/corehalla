import React, { FC } from 'react';
import styled from 'styled-components';
import { StatSmall, StatMedium, StatLarge, StatDesc } from '../TextStyles';

interface Props {
    tier: string;
    rating: number;
    peak: number;
    games: number;
    wins: number;
    losses: number;
    winrate: number;
    region: string;
}

const StatsContainer = styled.div``;

const RankedBanner = styled.img`
    width: 8rem;
    height: auto;
    margin-right: 2rem;
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
    region,
}: Props) => {
    return (
        <SectionWrapper>
            <RankedBanner src={`/assets/images/ranked-banners/${tier}.png`} alt={tier} />
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
                <FlagIcon src={`/assets/images/icons/flags/${region}.png`} alt={region} />
            </StatsContainer>
        </SectionWrapper>
    );
};
