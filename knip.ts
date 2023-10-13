import type { KnipConfig } from "knip"

const config: KnipConfig = {
    ignore: [
        "**/.next/**",
        "packages/db/generated/**",
        "**/reaccord.config.js",
        // TODO: remove this
        "packages/server/**",
    ],
    ignoreDependencies: ["encoding", "sharp"],
}

export default config
