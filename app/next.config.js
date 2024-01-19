const BRAWLHALLA_WIKI_URL = "https://brawlhalla.fandom.com/wiki/Brawlhalla_Wiki"
const COREHALLA_DISCORD_URL = "https://discord.com/invite/eD248ez"
const COREHALLA_GITHUB_URL = "https://github.com/djobbo/corehalla"
const COREHALLA_TWITTER_URL = "https://twitter.com/Corehalla"
const COREHALLA_KOFI_URL = "https://ko-fi.com/corehalla"

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    transpilePackages: [
        "bhapi",
        "ui",
        "logger",
        "common",
        "db",
        "web-parser",
        "server",
    ],
    images: {
        domains: ["cdn.discordapp.com", "www.brawlhalla.com"],
    },
    experimental: {
        logging: {
            level: "verbose",
            fullUrl: true,
        },
    },
    async redirects() {
        return [
            {
                source: "/wiki",
                destination: BRAWLHALLA_WIKI_URL,
                permanent: true,
            },
            {
                source: "/discord",
                destination: COREHALLA_DISCORD_URL,
                permanent: true,
            },
            {
                source: "/github",
                destination: COREHALLA_GITHUB_URL,
                permanent: true,
            },
            {
                source: "/twitter",
                destination: COREHALLA_TWITTER_URL,
                permanent: true,
            },
            {
                source: "/kofi",
                destination: COREHALLA_KOFI_URL,
                permanent: true,
            },
            {
                source: "/donate",
                destination: COREHALLA_KOFI_URL,
                permanent: true,
            },
            {
                source: "/stats/me",
                destination: "/",
                permanent: true,
            },
            {
                source: "/rankings",
                destination: "/rankings/1v1",
                permanent: true,
            },
            {
                source: "/leaderboard/:path*",
                destination: "/rankings",
                permanent: true,
            },
            {
                source: "/p/:path*",
                destination: "/stats/player/:path*",
                permanent: true,
            },
            {
                source: "/c/:path*",
                destination: "/stats/clan/:path*",
                permanent: true,
            },
        ]
    },
}

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
})
module.exports = withBundleAnalyzer(config)
