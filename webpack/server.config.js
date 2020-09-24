const path = require('path');
var nodeExternals = require('webpack-node-externals');

const commonConfig = require('./common.config');

module.exports = {
    ...commonConfig,
    entry: './src/server/index.ts',
    output: {
        path: path.resolve(__dirname, '../functions'),
        filename: 'functions.js',
    },
    target: 'node',
    externals: [nodeExternals()],
};
