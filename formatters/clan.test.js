const { formatClan, sortClanMembers } = require('./clan');

test('Clan Members [No XP]', () => {
	const members = [
		{ rank: 'Leader', name: 'User1' },
		{ rank: 'Officer', name: 'User2' },
		{ rank: 'Recruit', name: 'User3' },
		{ rank: 'Member', name: 'User4' }
	];
	expect(sortClanMembers(members)).toEqual({
		members: {
			leader: [{ name: 'User1' }],
			officer: [{ name: 'User2' }],
			member: [{ name: 'User4' }],
			recruit: [{ name: 'User3' }]
		},
		xpInClan: 0
	});
});

test('Clan Members [Full]', () => {
	const members = [
		{ rank: 'Leader', name: 'User1', xp: 10 },
		{ rank: 'Officer', name: 'User2', xp: 30 },
		{ rank: 'Recruit', name: 'User3', xp: 18 },
		{ rank: 'Member', name: 'User4', xp: 123 }
	];
	expect(sortClanMembers(members)).toEqual({
		members: {
			leader: [{ name: 'User1', xp: 10 }],
			officer: [{ name: 'User2', xp: 30 }],
			member: [{ name: 'User4', xp: 123 }],
			recruit: [{ name: 'User3', xp: 18 }]
		},
		xpInClan: 181
	});
});

test('Clan Members [Blank]', () => {
	const members = [];
	expect(sortClanMembers(members)).toEqual({
		members: {
			leader: [],
			officer: [],
			member: [],
			recruit: []
		},
		xpInClan: 0
	});
});

test('Clan Members [Undefined]', () => {
	expect(sortClanMembers(undefined)).toBe(false);
});

test('Clan Format [Full]', () => {
	const clan = {
		clan_name: 'test',
		clan: [{ rank: 'Leader', name: 'User1', xp: 10 }]
	};
	expect(formatClan(clan)).toEqual({
		clan_name: 'test',
		memberCount: 1,
		members: {
			leader: [{ name: 'User1', xp: 10 }],
			officer: [],
			member: [],
			recruit: []
		},
		xpInClan: 10
	});
});

test('Clan Format [Blank]', () => {
	expect(formatClan({})).toEqual(false);
});

test('Clan Format [No Members]', () => {
	const clan = {
		clan_name: 'test123',
		clan: []
	};
	expect(formatClan(clan)).toEqual({
		clan_name: 'test123',
		memberCount: 0,
		members: {
			leader: [],
			officer: [],
			member: [],
			recruit: []
		},
		xpInClan: 0
	});
});

test('Clan Format [Undefined]', () => {
	expect(formatClan(undefined)).toBe(false);
});
