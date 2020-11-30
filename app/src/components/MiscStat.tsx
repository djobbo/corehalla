// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';

// Components imports
import { StatDesc } from './TextStyles';

interface IMiscStat {
    title: string;
    value: string;
}

const MiscStatWrapper = styled.p`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
`;

const MiscStatValue = styled.span`
    color: var(--text);
    font-size: 1.5rem;
    margin: 0 0.125rem;
`;

export const MiscStat: FC<IMiscStat> = ({ title, value }: IMiscStat) => {
    return (
        <MiscStatWrapper>
            <StatDesc>{title}</StatDesc>
            <MiscStatValue>{value}</MiscStatValue>
        </MiscStatWrapper>
    );
};

interface Props {
    stats: IMiscStat[];
}

const MiscStatsWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
`;

export const MiscStatContainer: FC<Props> = ({ stats }: Props) => {
    return (
        <MiscStatsWrapper>
            {stats.map((stat, i) => (
                <MiscStat key={i} {...stat} />
            ))}
        </MiscStatsWrapper>
    );
};
