import node from "@astrojs/node"
import react from "@astrojs/react"
import { defineConfig } from "astro/config"
import emdash, { local } from "emdash/astro"
import { sqlite } from "emdash/db"

/** Local CMS: Node + SQLite + filesystem media. Production uses D1/R2. */
export default defineConfig({
    output: "server",
    adapter: node({ mode: "standalone" }),
    integrations: [
        react(),
        emdash({
            siteUrl: "http://localhost:3002",
            database: sqlite({ url: "file:./emdash.db" }),
            storage: local({
                directory: "./data/uploads",
                baseUrl: "/_emdash/api/media/file",
            }),
        }),
    ],
    image: {
        layout: "constrained",
        responsiveStyles: true,
    },
    vite: {
        server: {
            watch: {
                // SQLite, uploads and typegen are runtime outputs; watching
                // them restarts Vite mid-request while seeding.
                ignored: ["**/data/**", "**/emdash.db*", "**/.astro/**"],
            },
        },
    },
})
