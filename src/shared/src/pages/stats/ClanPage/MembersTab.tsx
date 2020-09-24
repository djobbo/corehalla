// Library imports
import React, { FC, useState } from 'react';
import { IClanMemberFormat } from 'corehalla.js';

import { RankingsItemClan } from '../../../components/RankingsItem';
import { Select } from '../../../components/Select';

interface Props {
    members: IClanMemberFormat[];
    clanXP: number;
}

type MembersSort = 'default' | 'xp';

const getSortedProp = (state: MembersSort, member: IClanMemberFormat) => {
    switch (state) {
        case 'xp':
            return member.xp;
        default:
            return -member.joinDate;
    }
};

export const MembersTab: FC<Props> = ({ members, clanXP }: Props) => {
    const [sort, setSort] = useState<MembersSort>('default');

    return (
        <>
            <Select<MembersSort>
                action={setSort}
                title="Sort by"
                options={[
                    { name: 'Join Date', value: 'default' },
                    { name: 'xp', value: 'xp' },
                ]}
            />
            {members
                .sort((a, b) => (getSortedProp(sort, a) < getSortedProp(sort, b) ? 1 : -1))
                .map((member) => (
                    <RankingsItemClan player={member} clanXP={clanXP} key={member.id} />
                ))}
        </>
    );
};
