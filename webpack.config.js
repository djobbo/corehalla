const path = require('path');

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
	plugins: [],
	resolve: {
		extensions: ['.ts', '.js'],
	},
	optimization: {
		minimize: name.indexOf('min') > -1,
	},
	externals: {
		axios: 'axios',
	},
});

module.exports = ['main', 'corehalla.min'].map(generateConfig);
