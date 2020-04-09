export function sortClanMembers(members: corehalla.IClanMember[]) {
	return members.reduce<{
		members: {
			Leader: corehalla.IClanMember[];
			Officer: corehalla.IClanMember[];
			Member: corehalla.IClanMember[];
			Recruit: corehalla.IClanMember[];
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

export default function formatClan({
	clan: members,
	...clan
}: corehalla.IClan): corehalla.IClanFormat {
	return {
		...clan,
		memberCount: members.length,
		...sortClanMembers(members),
	};
}
