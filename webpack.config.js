const path = require('path');
const DeclarationBundlerPlugin = require('declaration-bundler-webpack-plugin');
const BundleTSDec = require('./plugins/BundleTSDec');

const generateConfig = (name) => ({
	mode: 'production',
	entry: './src/main.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: name + '.js',
		sourceMapFilename: name + '.map',
		library: 'corehalla',
		libraryTarget: 'umd',
		globalObject: 'this',
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new BundleTSDec({
			moduleName: 'corehalla',
			output: './corehalla.d.ts',
			globalDeclaration: true,
		}),
	],
	resolve: {
		extensions: ['.ts', '.js'],
	},
	optimization: {
		minimize: name.indexOf('min') > -1,
	},
});

module.exports = ['corehalla', 'corehalla.min'].map(generateConfig);
