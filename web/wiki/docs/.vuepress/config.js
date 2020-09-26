const { description } = require('../../package');

const { generateSidebar } = require('./util/generateSidebar');

module.exports = {
	title: 'Corehalla Wiki',
	description: description,

	head: [
		['meta', { name: 'theme-color', content: '#FF732F' }],
		['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
		[
			'meta',
			{ name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
		],
	],

	themeConfig: {
		repo: '',
		editLinks: false,
		docsDir: '',
		editLinkText: '',
		lastUpdated: false,
		nav: [
			{
				text: 'About',
				link: '/about/',
			},
			{
				text: 'Corehalla',
				link: 'https://neue.corehalla.com',
			},
		],
		sidebar: {
			'/about/': [
				{
					title: 'Guide',
					children: ['', 'using-vue'],
				},
			],
		},
	},

	plugins: [
		'@vuepress/plugin-back-to-top',
		'@vuepress/plugin-medium-zoom',
		[
			'vuepress-plugin-typescript',
			{
				tsLoaderOptions: {
					// All options of ts-loader
				},
			},
		],
	],
};
