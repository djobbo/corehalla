import { ClanRank } from '../..';

//#region Clan Format
export interface IClanFormat {
    id: number;
    name: string;
    creationDate: number;
    xp: string;
    memberCount: number;
    members: {
        [k in ClanRank]?: IClanMemberFormat[];
    };
    xpInClan: number;
}

export interface IClanMemberFormat {
    id: number;
    name: string;
    joinDate: number;
    xp: number;
}
//#endregion
