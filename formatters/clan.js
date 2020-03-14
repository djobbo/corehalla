module.exports = ({ clan: members, ...clan }) => ({
	...clan,
	memberCount: members.length,
	...members.reduce(
		(acc, p) => {
			acc.members[p.rank.toLowerCase()].push({
				...p,
				xp_percentage: ((p.xp / clan.clan_xp) * 100).toFixed(2)
			});
			acc.xpInClan += p.xp;
			return acc;
		},
		{
			members: {
				leader: [],
				officer: [],
				member: [],
				recruit: []
			},
			xpInClan: 0
		}
	)
});
