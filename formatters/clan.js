function formatClan(clanStats) {
	if (!clanStats) return false;
	const { clan: members, ...clan } = clanStats;
	if (!members || !clan) return false;
	return {
		...clan,
		memberCount: members.length,
		...sortClanMembers(members)
	};
}

function sortClanMembers(members) {
	return members
		? members.reduce(
				(acc, { rank, ...p }) => {
					acc.members[rank.toLowerCase()].push(p);
					acc.xpInClan += p.xp || 0;
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
		: false;
}

exports.formatClan = formatClan;
exports.sortClanMembers = sortClanMembers;
