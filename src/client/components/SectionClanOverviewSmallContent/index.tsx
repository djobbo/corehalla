import React, { FC } from 'react';
import { StatSmall, StatMedium, StatDesc } from '../TextStyles';

interface Props {
    name: string;
    level: number;
    xp: number;
    personalXp: number;
    xpPercentage: number;
}

export const SectionClanOverviewSmallContent: FC<Props> = ({ name, level, xp, personalXp, xpPercentage }: Props) => {
    return (
        <div>
            <StatMedium>{name}</StatMedium>
            <div>
                <StatDesc>level</StatDesc>
                <StatSmall>{level}</StatSmall>
                <StatDesc>({xp} xp)</StatDesc>
            </div>
            <div>
                <StatDesc>personal xp</StatDesc>
                <StatSmall>{personalXp}</StatSmall>
                <StatDesc>({xpPercentage.toFixed(2)}%)</StatDesc>
            </div>
        </div>
    );
};
