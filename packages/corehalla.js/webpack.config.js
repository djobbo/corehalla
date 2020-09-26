const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
    target: 'node',
    entry: {
        index: './src/main.ts',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'main.js',
        library: 'Corehalla',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true,
    },
    watchOptions: {
        aggregateTimeout: 600,
        ignored: /node_modules/,
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './dist')],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts/,
                exclude: [/node_modules/, /test/],
                use: ['babel-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
};

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        // Prod
    } else {
        // Dev
    }

    return config;
};
