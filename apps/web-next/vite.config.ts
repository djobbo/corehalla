import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite-plus"

/**
 * `web-next` — the UX study, and the seed of the future main app.
 *
 * Same stack as `apps/web` (TanStack Start + Tailwind v4 + Effect atoms), built
 * to test the interaction design rather than the visual design. Styling is
 * deliberately minimal: only where a control is unusable without it.
 *
 * ## How it reaches the API
 *
 * The browser calls `/api/v1/*` as a *relative* path and this dev server proxies
 * it to `VITE_API_ORIGIN`. That keeps the app same-origin — which is the shape it
 * will have in production, where the API worker is routed on the site hostname —
 * and avoids CORS entirely. Server-side rendering cannot use a relative URL, so
 * it talks to `VITE_API_ORIGIN` directly (see `src/effect/client.ts`).
 *
 * The origin defaults to a locally running API worker. `corehalla.com` is not a
 * usable target: it answers non-browser requests with a Cloudflare bot challenge,
 * so a server-side proxy to it returns 403.
 */
const apiOrigin = process.env["VITE_API_ORIGIN"] ?? "http://localhost:8787"

const PORT = 3001

export default defineConfig({
    server: {
        port: PORT,
        proxy: {
            "/api/v1": { target: apiOrigin, changeOrigin: true },
        },
    },
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [tanstackStart(), viteReact(), tailwindcss()],
})
