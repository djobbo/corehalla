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
		umdNamedDefine: true,
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
	resolve: {
		extensions: ['.ts', '.js'],
	},
	optimization: {
		minimize: name.indexOf('min') > -1,
	},
});

module.exports = ['corehalla', 'corehalla.min'].map(generateConfig);
