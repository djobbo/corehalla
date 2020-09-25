const path = require('path');
const StartServerPlugin = require('start-server-webpack-plugin');

const commonServerConfig = require('./server.common.config');

module.exports = {
    ...commonServerConfig,
    mode: 'development',
    entry: ['./src/server/devServer.ts'],
    output: {
        path: path.resolve(__dirname, '../devServer'),
        filename: 'server.js',
    },
    plugins: [new StartServerPlugin({ name: 'server.js', nodeArgs: ['--inspect'] })],
};
