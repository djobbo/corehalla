// Library imports
import React, { FC, useState } from 'react';

// Components
import { BarChartCard } from '../../../components/BarChartCard';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { SectionSeparator } from '../../../components/PageSection';
import type { IClanFormat, IClanMemberFormat } from 'corehalla';

interface Props {
    clanStats: IClanFormat;
}

export const OverviewTab: FC<Props> = ({ clanStats }: Props) => {
    const [clanmates] = useState<[IClanMemberFormat[], IClanMemberFormat[], IClanMemberFormat[]]>([
        clanStats.members.filter((x) => x.rank === 'Officer'),
        clanStats.members.filter((x) => x.rank === 'Member'),
        clanStats.members.filter((x) => x.rank === 'Recruit'),
    ]);
    return (
        <>
            <ProfileHeader
                title={clanStats.name}
                bannerURI="https://picsum.photos/480/120"
                favorite={{
                    id: clanStats.id.toString(),
                    name: clanStats.name,
                    thumbURI: '/assets/favicon.png',
                    type: 'clan',
                }}
            />
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
                        amount: clanmates[0].length,
                        max: clanStats.memberCount,
                    },
                    {
                        title: 'Members',
                        amount: clanmates[1].length,
                        max: clanStats.memberCount,
                    },
                    {
                        title: 'Recruits',
                        amount: clanmates[2].length,
                        max: clanStats.memberCount,
                    },
                ]}
            />
        </>
    );
};
