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
 * It does not, directly, and nothing here configures an origin. The browser
 * calls `/api/v1/*` on its own origin and the app forwards that to the API
 * worker over a service binding — `src/routes/api/v1/$.ts` for browser requests,
 * `src/server.ts` for the render.
 *
 * There is deliberately no proxy either: a proxy target would have to name the
 * API's port, and Alchemy reassigns that port on every dev run.
 */
const PORT = 3001

export default defineConfig({
    server: {
        port: PORT,
    },
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [tanstackStart(), viteReact(), tailwindcss()],
})
