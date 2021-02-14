import type {
	IClanMember,
	IClan,
	IClanFormat,
	IClanMemberFormat,
} from 'corehalla';

export function formatClan({
	clan: members,
	clan_id,
	clan_name,
	clan_create_date,
	clan_xp,
}: IClan): IClanFormat {
	return {
		id: clan_id,
		name: clan_name,
		creationDate: clan_create_date,
		xp: clan_xp,
		memberCount: members.length,
		...sortClanMembers(members),
	};
}

export function sortClanMembers(members: IClanMember[]) {
	return members.reduce<{
		members: IClanMemberFormat[];
		xpInClan: number;
	}>(
		(acc, { rank, brawlhalla_id, name, join_date, xp }) => {
			acc.members = [
				...acc.members,
				{
					id: brawlhalla_id,
					name,
					rank,
					joinDate: join_date,
					xp,
				},
			];
			acc.xpInClan += xp || 0;
			return acc;
		},
		{
			members: [],
			xpInClan: 0,
		}
	);
}
