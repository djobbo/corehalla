const { description } = require('../../package');

module.exports = {
	title: 'Corehalla Wiki',
	description: description,
	themeConfig: {
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'About', link: '/about/' },
			{ text: 'External', link: 'https://google.com' },
		],
		sidebar: [
			'',
			{
				title: 'About',
				path: '/about/',
				collapsable: false,
				children: [
					['/about/', 'About Brawlhalla'],
					{
						title: 'Legends',
						path: '/about/legends/',
						collapsable: false,
						children: [
							['/about/legends/', 'All Legends'],
							'/about/legends/bodvar',
						],
					},
				],
			},
		],
	},
};
