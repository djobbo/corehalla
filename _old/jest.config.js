module.exports = {
    moduleDirectories: ['node_modules'],
    transform: {
        '\\.tsx?$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.json',
        },
    },
}
