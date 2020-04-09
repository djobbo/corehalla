const sortClanMembers = (members: corehalla.IClanMember[]) =>
	members.reduce<{
		members: {
			Leader: corehalla.IClanMember[];
			Officer: corehalla.IClanMember[];
			Member: corehalla.IClanMember[];
			Recruit: corehalla.IClanMember[];
		};
		xpInClan: number;
	}>(
		(acc, { rank, ...p }) => {
			acc.members[rank].push(p);
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

const formatClan = ({ clan: members, ...clan }: corehalla.IClan) => ({
	...clan,
	memberCount: members.length,
	...sortClanMembers(members),
});

export default formatClan;
