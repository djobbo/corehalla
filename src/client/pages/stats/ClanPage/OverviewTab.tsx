// Library imports
import React, { FC } from 'react';
import { IClanFormat } from 'corehalla.js';

// Components
import { BarChartCard } from '../../../components/BarChartCard';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { SectionSeparator } from '../../../components/PageSection';

interface Props {
    clanStats: IClanFormat;
}

export const OverviewTab: FC<Props> = ({ clanStats }: Props) => {
    return (
        <>
            <ProfileHeader title={clanStats.name} bannerURI="https://picsum.photos/480/120" />
            <SectionSeparator />
            <BarChartCard
                title="members"
                stats={[
                    {
                        title: 'Leader',
                        amount: 1,
                        max: clanStats.memberCount,
                    },
                    {
                        title: 'Officers',
                        amount: clanStats.members.Officer.length,
                        max: clanStats.memberCount,
                    },
                    {
                        title: 'Members',
                        amount: clanStats.members.Member.length,
                        max: clanStats.memberCount,
                    },
                    {
                        title: 'Recruits',
                        amount: clanStats.members.Recruit.length,
                        max: clanStats.memberCount,
                    },
                ]}
            />
        </>
    );
};
