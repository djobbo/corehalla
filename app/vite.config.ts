import path from "node:path"
import { fileURLToPath } from "node:url"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite-plus"

const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..")

export default defineConfig({
    envDir: repoRoot,
    envPrefix: "VITE_",
    server: {
        port: 3000,
    },
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [
        tailwindcss(),
        tanstackStart({
            srcDirectory: "src",
        }),
        viteReact(),
        nitro(),
    ],
    ssr: {
        noExternal: [
            "bhapi",
            "ui",
            "logger",
            "common",
            "db",
            "web-parser",
            "server",
        ],
    },
})
