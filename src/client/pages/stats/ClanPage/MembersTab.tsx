// Library imports
import React, { FC } from 'react';
import { IClanFormat } from 'corehalla.js';

interface Props {
    clanStats: IClanFormat;
}

export const MembersTab: FC<Props> = ({}: Props) => {
    return (
        <>
            <h1>Members</h1>
        </>
    );
};
