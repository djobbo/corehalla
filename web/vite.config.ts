import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite-plus"

/**
 * TanStack Start application (the Next.js replacement).
 *
 * - Vite is the bundler.
 * - `nitro()` produces the deployment output (`node-server` locally, the
 *   `vercel` preset when built on Vercel via the `VERCEL` env var).
 * - `publicDir` points at the existing Next.js `public/` folder so both apps
 *   keep serving the same static assets until the cutover is complete.
 */
export default defineConfig({
    server: {
        port: 3000,
    },
    resolve: {
        tsconfigPaths: true,
    },
    // Expose only the analytics/Supabase variables the browser genuinely needs.
    // The legacy `NEXT_PUBLIC_` names are kept so the deployed environment does
    // not change; new variables should use `VITE_`.
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    publicDir: "../app/public",
    plugins: [
        tanstackStart(),
        nitro(),
        // react's vite plugin must come after start's vite plugin
        viteReact(),
        tailwindcss(),
    ],
})
