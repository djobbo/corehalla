export function sortClanMembers(members: IClanMember[]) {
	return members.reduce<{
		members: {
			Leader: IClanMember[];
			Officer: IClanMember[];
			Member: IClanMember[];
			Recruit: IClanMember[];
		};
		xpInClan: number;
	}>(
		(acc, p) => {
			acc.members[p.rank].push(p);
			acc.xpInClan += p.xp || 0;
			return acc;
		},
		{
			members: {
				Leader: [],
				Officer: [],
				Member: [],
				Recruit: [],
			},
			xpInClan: 0,
		}
	);
}

export function formatClan({ clan: members, ...clan }: IClan): IClanFormat {
	return {
		...clan,
		memberCount: members.length,
		...sortClanMembers(members),
	};
}
