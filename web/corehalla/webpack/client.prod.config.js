const HtmlWebPackPlugin = require('html-webpack-plugin');

const commonClientConfig = require('./client.common.config');

module.exports = {
    ...commonClientConfig,
    mode: 'production',
    plugins: [
        // TODO: Remove this
        ...commonClientConfig.plugins,
        new HtmlWebPackPlugin({
            template: 'src/client/index.ejs',
            filename: 'index.html',
            inject: 'body',
        }),
    ],
};
