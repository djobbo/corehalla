// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require("next-transpile-modules")([
    "bhapi",
    "ui",
    "logger",
    "common",
])

module.exports = withTM({
    reactStrictMode: true,
    images: {
        domains: ["raw.githubusercontent.com", "images.smash.gg"],
    },
})
