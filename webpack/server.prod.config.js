const path = require('path');
var GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
var nodeExternals = require('webpack-node-externals');

const commonServerConfig = require('./server.common.config');

const basePackageValues = {
    name: 'functions',
    version: '1.0.0',
    main: './functions.js',
};

const versionsPackageFilename = path.resolve(__dirname, '../package.json');

module.exports = {
    ...commonServerConfig,
    mode: 'production',
    entry: './src/server/index.ts',
    output: {
        path: path.resolve(__dirname, '../functions'),
        filename: 'functions.js',
    },
    target: 'node',
    externals: [nodeExternals()],
    plugins: [new GeneratePackageJsonPlugin(basePackageValues, versionsPackageFilename)],
};