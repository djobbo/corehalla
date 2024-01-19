import type { KnipConfig } from "knip"

const config: KnipConfig = {
    ignore: [
        "**/.next/**",
        "packages/db/generated/**",
        "**/reaccord.config.js",
        // TODO: remove this
        "packages/server/**",
        ".obsidian/**",
        "**/TransRSC.tsx",
    ],
    ignoreDependencies: [
        "encoding",
        "sharp",
        "@lingui/conf",
        "@lingui/loader",
        "@lingui/swc-plugin",
    ],
}

export default config
