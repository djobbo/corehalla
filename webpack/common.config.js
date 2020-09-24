module.exports = {
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                use: ['babel-loader', 'eslint-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    watchOptions: {
        aggregateTimeout: 600,
        ignored: /node_modules/,
    },
};
