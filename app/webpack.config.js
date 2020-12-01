const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        app: path.join(__dirname, 'src', 'index.tsx'),
    },
    target: 'web',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.css'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: '/node_modules/',
                options: {
                    transpileOnly: true,
                    happyPackMode: true,
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        pathinfo: false,
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html'),
        }),
    ],
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        historyApiFallback: true,
        hot: true,
        publicPath: '/dist',
    },
};
