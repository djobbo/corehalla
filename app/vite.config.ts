import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

export default defineConfig({
    envPrefix: ["NEXT_PUBLIC_", "VITE_"],
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
