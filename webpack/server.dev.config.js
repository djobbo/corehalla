const path = require('path');
const StartServerPlugin = require('start-server-webpack-plugin');

const commonConfig = require('./common.config');

module.exports = {
    ...commonConfig,
    entry: ['./src/server/devServer.ts'],
    output: {
        path: path.resolve(__dirname, '../devServer'),
        filename: 'server.js',
    },
    target: 'node',
    plugins: [new StartServerPlugin({ name: 'server.js', nodeArgs: ['--inspect'] })],
};
