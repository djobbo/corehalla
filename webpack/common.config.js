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
};
