const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/client/index.tsx',
    output: {
        path: __dirname,
        filename: './dist/js/bundle.js',
        publicPath: '/dist/',
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
    resolveLoader: {
        modules: ['node_modules', path.resolve(__dirname, 'loaders')],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.html', '.md', '.json'],
    },
    devServer: {
        port: 31199,
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        inline: true,
        historyApiFallback: {
            index: 'index.html',
        },
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: 'src/public', to: './dist' }],
        }),
        new HtmlWebPackPlugin({
            template: 'src/public/index.html',
            filename: 'dist/index.html',
        }),
    ],
    stats: 'errors-warnings',
};
