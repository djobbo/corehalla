module.exports = {
	entry: {
		corehalla: './src/index.ts',
		'corehalla.min': './src/index.ts',
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
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			sourceMap: true,
			include: /\.min\.js$/,
		}),
	],
	module: {
		loaders: [
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
};
