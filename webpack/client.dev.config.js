const HtmlWebPackPlugin = require('html-webpack-plugin');

const commonClientConfig = require('./client.common.config');

module.exports = {
    ...commonClientConfig,
    mode: 'development',
    plugins: [
        ...commonClientConfig.plugins,
        new HtmlWebPackPlugin({
            template: 'src/client/index.ejs',
            filename: 'index.html',
            inject: 'body',
        }),
    ],
};
