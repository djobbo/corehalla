// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require("next-transpile-modules")([
    "bhapi",
    "ui",
    "logger",
    "common",
    "db",
    "web-parser",
])

module.exports = withTM({
    reactStrictMode: true,
    images: {
        domains: ["cdn.discordapp.com", "www.brawlhalla.com"],
    },
})
