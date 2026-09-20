import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite-plus"

/**
 * TanStack Start application (the Next.js replacement).
 *
 * - Vite is the bundler.
 * - Alchemy's `Cloudflare.Website.Vite` (see `alchemy.run.ts`) supplies the
 *   Cloudflare plugin and builds the `ssr` environment into a Worker, so this
 *   config must not add `@cloudflare/vite-plugin` or Nitro itself.
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
    // Expose only the variables the browser genuinely needs. `VITE_` is
    // preferred; the legacy `NEXT_PUBLIC_` names are still read for analytics.
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    publicDir: "../app/public",
    plugins: [
        tanstackStart(),
        // react's vite plugin must come after start's vite plugin
        viteReact(),
        tailwindcss(),
    ],
})
