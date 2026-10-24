import react from "@astrojs/react"
import { d1, r2 } from "@emdash-cms/cloudflare"
import { defineConfig } from "astro/config"
import emdash from "emdash/astro"

/** Shared EmDash config; the adapter is supplied by the host. */
export default defineConfig({
    output: "server",
    integrations: [
        react(),
        emdash({
            database: d1({ binding: "DB", session: "auto" }),
            storage: r2({ binding: "MEDIA" }),
        }),
    ],
    image: {
        layout: "constrained",
        responsiveStyles: true,
    },
})
