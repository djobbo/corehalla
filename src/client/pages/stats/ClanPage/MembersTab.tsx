// Library imports
import React, { FC } from 'react';
import { IClanFormat } from 'corehalla.js';

import { RankingsItemClan } from '../../../components/RankingsItem';

interface Props {
    clanStats: IClanFormat;
}

export const MembersTab: FC<Props> = ({ clanStats: { members, xp } }: Props) => {
    return (
        <>
            {members.map((member) => (
                <RankingsItemClan player={member} clanXP={parseInt(xp)} key={member.id} />
            ))}
        </>
    );
};
