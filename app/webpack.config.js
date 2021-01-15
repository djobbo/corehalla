const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const common = {
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
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html'),
        }),
    ],
};

const prodConfig = {
    ...common,
    mode: 'production',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '..', 'static', 'dist', 'app'),
        pathinfo: false,
    },
};

const devConfig = {
    ...common,
    mode: 'development',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        pathinfo: false,
    },
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        public: 'localhost',
        historyApiFallback: true,
        hot: true,
        contentBase: path.join(__dirname, 'dist'),
        publicPath: '/',
    },
};

module.exports = (env) => {
    console.log(env);
    return env && env.NODE_ENV === 'production' ? prodConfig : devConfig;
};
