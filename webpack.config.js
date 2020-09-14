const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/client/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: './assets/js/bundle.js',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            publicPath: (url) => url.replace(/public/, ''),
                        },
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: { plugins: [autoprefixer()] },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(j|t)sx?$/,
                use: ['babel-loader', 'eslint-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: ['html-loader'],
            },
            {
                test: /\.md$/,
                use: ['babel-loader', 'frontmatter-markdown-loader', 'sanitize-md-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.html', '.md', '.json'],
    },
    devServer: {
        host: process.env.HOST || 'localhost',
        port: 31199,
        contentBase: 'dist',
        compress: true,
        inline: true,
        historyApiFallback: true,
        hot: true,
        publicPath: '/',
    },
    plugins: [
        new Dotenv(),
        new CopyWebpackPlugin({
            patterns: [{ from: 'src/public', to: './' }],
        }),
        new HtmlWebPackPlugin({
            template: 'src/public/index.html',
            filename: 'index.html',
            inject: false,
        }),
    ],
    stats: 'errors-warnings',
};
