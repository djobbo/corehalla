module.exports = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['babel-loader', 'eslint-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.json'],
    },
    watchOptions: {
        aggregateTimeout: 600,
        ignored: /node_modules/,
    },
};
