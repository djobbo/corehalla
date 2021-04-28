import type { ClanRank } from './general';

export interface IClanFormat {
    id: number;
    name: string;
    creationDate: number;
    xp: string;
    memberCount: number;
    members: IClanMemberFormat[];
    xpInClan: number;
}

export interface IClanMemberFormat {
    id: number;
    name: string;
    rank: ClanRank;
    joinDate: number;
    xp: number;
}
