const {
    BRAWLHALLA_WIKI_URL,
    COREHALLA_DISCORD_URL,
    COREHALLA_GITHUB_URL,
    COREHALLA_TWITTER_URL,
    COREHALLA_KOFI_URL,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("./socials")

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path")

const TRANS_VIRTUAL_MODULE_NAME = "virtual-lingui-trans"

class LinguiTransRscResolver {
    apply(resolver) {
        const target = resolver.ensureHook("resolve")
        resolver
            .getHook("resolve")
            .tapAsync(
                "LinguiTransRscResolver",
                (request, resolveContext, callback) => {
                    if (request.request === TRANS_VIRTUAL_MODULE_NAME) {
                        const req = {
                            ...request,
                            request:
                                request.context.issuerLayer === "rsc"
                                    ? // RSC Version without Context
                                      path.resolve("./i18n/TransRSC.tsx")
                                    : // Regular version
                                      "@lingui/react",
                        }

                        return resolver.doResolve(
                            target,
                            req,
                            null,
                            resolveContext,
                            callback,
                        )
                    }

                    callback()
                },
            )
    }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["bhapi", "common", "db", "ui"],
    images: {
        remotePatterns: [
            {
                hostname: "cdn.discordapp.com",
            },
            {
                hostname: "www.brawlhalla.com",
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    experimental: {
        swcPlugins: [
            [
                "@lingui/swc-plugin",
                {
                    runtimeModules: {
                        trans: [TRANS_VIRTUAL_MODULE_NAME, "Trans"],
                    },
                },
            ],
        ],
    },
    webpack(config) {
        config.resolve.plugins.push(new LinguiTransRscResolver())
        return config
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
                source: "/rankings/:path*",
                destination: "/ranked/:path*",
                permanent: true,
            },
            {
                source: "/ranked",
                destination: "/ranked/1v1",
                permanent: true,
            },
            {
                source: "/leaderboard/:path*",
                destination: "/ranked",
                permanent: true,
            },
            {
                source: "/stats/player/:path*",
                destination: "/player/:path*",
                permanent: true,
            },
            {
                source: "/stats/clan/:path*",
                destination: "/clan/:path*",
                permanent: true,
            },
            {
                source: "/p/:path*",
                destination: "/player/:path*",
                permanent: true,
            },
            {
                source: "/c/:path*",
                destination: "/clan/:path*",
                permanent: true,
            },
            {
                source: "/calc/:path*",
                destination: "/calculator/:path*",
                permanent: true,
            },
            {
                source: "/@me/:path*",
                destination: "/me/:path*",
                permanent: true,
            },
        ]
    },
}

module.exports = nextConfig
