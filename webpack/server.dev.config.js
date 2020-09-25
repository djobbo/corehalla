const path = require('path');
const StartServerPlugin = require('start-server-webpack-plugin');
const webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

const commonConfig = require('./common.config');

module.exports = {
    ...commonConfig,
    entry: ['webpack/hot/poll?1000', './src/server/devServer.ts'],
    output: {
        path: path.resolve(__dirname, '../devServer'),
        filename: 'server.js',
    },
    target: 'node',
    externals: nodeExternals({
        allowlist: ['webpack/hot/poll?1000'],
    }),
    plugins: [
        new StartServerPlugin({ name: 'server.js', nodeArgs: ['--inspect'] }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                BUILD_TARGET: JSON.stringify('server'),
            },
        }),
    ],
};
