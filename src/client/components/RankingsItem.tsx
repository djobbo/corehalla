// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';
import { IRanking1v1Format } from 'corehalla.js';

import { StatLarge, StatDesc, StatSmall, StatMedium } from './TextStyles';
import { BarChart } from './Charts';

interface Props {
    player: IRanking1v1Format;
}

const BarChartWrapper = styled.div`
    display: flex;
    align-items: center;

    span {
        margin-left: 1rem;
    }
`;

const StatsWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Wrapper = styled.div`
    margin: 0.5rem 0;
`;

export const RankingsItem: FC<Props> = ({ player }: Props) => {
    return (
        <Wrapper>
            <StatsWrapper>
                <div>
                    <StatMedium>{player.name}</StatMedium>
                    <p>
                        <StatSmall>{player.games}</StatSmall>
                        <StatDesc>games</StatDesc>
                        <StatSmall>
                            ({player.wins}W-{player.games - player.wins}L)
                        </StatSmall>
                    </p>
                </div>
                <div>
                    <StatLarge>{player.rating}</StatLarge>
                    <p>
                        <StatSmall>{player.peak}</StatSmall>
                        <StatDesc>peak</StatDesc>
                    </p>
                </div>
            </StatsWrapper>
            <BarChartWrapper>
                <BarChart
                    width="100%"
                    amount={(player.wins / player.games) * 100}
                    height="0.25rem"
                    bg="var(--bg-alt)"
                />
                <StatDesc>{((player.wins / player.games) * 100).toFixed(2)}%</StatDesc>
            </BarChartWrapper>
        </Wrapper>
    );
};
