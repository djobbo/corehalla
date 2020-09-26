module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '.git', '/dist/'],
    setupFiles: ['./setupJest.ts'],
    automock: false,
};
