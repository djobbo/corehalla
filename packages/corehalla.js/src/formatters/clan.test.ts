import { ClanRank, IClan, IClanFormat } from '../types';

import { formatClan } from './clan';

const testClanData = JSON.parse(`{
    "clan_id": 1,
    "clan_name": "Blue Mammoth Games",
    "clan_create_date": 1464206400,
    "clan_xp": "86962",
    "clan": [
        {
            "brawlhalla_id": 3,
            "name": "[BMG] Chill Penguin X",
            "rank": "Leader",
            "join_date": 1464206400,
            "xp": 6664
        },
        {
            "brawlhalla_id": 2,
            "name": "bmg | dan",
            "rank": "Officer",
            "join_date": 1464221047,
            "xp": 4492
        }
    ]
}`) as IClan;

test('Correct Clan Format', () => {
    const clanFormat = formatClan(testClanData);

    expect(clanFormat.id).toBe(1);
    expect(clanFormat.name).toBe('Blue Mammoth Games');
    expect(clanFormat.creationDate).toBe(1464206400);
    expect(clanFormat.xp).toBe('86962');
    expect(clanFormat.memberCount).toBe(2);
    expect(clanFormat.xpInClan).toBe(11156);

    expect(clanFormat.members.length).toBe(2);

    expect(clanFormat.members[0].id).toBe(3);
    expect(clanFormat.members[0].name).toBe('[BMG] Chill Penguin X');
    expect(clanFormat.members[0].rank).toBe<ClanRank>('Leader');
    expect(clanFormat.members[0].joinDate).toBe(1464206400);
    expect(clanFormat.members[0].xp).toBe(6664);

    expect(clanFormat.members[1].id).toBe(2);
    expect(clanFormat.members[1].name).toBe('bmg | dan');
    expect(clanFormat.members[1].rank).toBe<ClanRank>('Officer');
    expect(clanFormat.members[1].joinDate).toBe(1464221047);
    expect(clanFormat.members[1].xp).toBe(4492);
});
