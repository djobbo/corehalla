const webpack = require('webpack');
const path = require('path');

module.exports = {
	mode: 'production',
	entry: {
		corehalla: './src/main.ts',
		'corehalla.min': './src/main.ts',
	},
	output: {
		path: path.resolve(__dirname, '_bundles'),
		filename: '[name].js',
		libraryTarget: 'umd',
		library: 'Corehalla',
		umdNamedDefine: true,
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'awesome-typescript-loader',
				exclude: /node_modules/,
				query: {
					declaration: false,
				},
			},
		],
	},
	optimization: {
		minimize: true,
	},
};
