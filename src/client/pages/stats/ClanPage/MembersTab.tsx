// Library imports
import React, { FC } from 'react';
import { IClanFormat, IClanMemberFormat } from 'corehalla.js';

import { RankingsItemClan } from '../../../components/RankingsItem';

interface Props {
    members: IClanMemberFormat[];
    clanXP: number;
}

export const MembersTab: FC<Props> = ({ members, clanXP }: Props) => {
    return (
        <>
            {members.map((member) => (
                <RankingsItemClan player={member} clanXP={clanXP} key={member.id} />
            ))}
        </>
    );
};
