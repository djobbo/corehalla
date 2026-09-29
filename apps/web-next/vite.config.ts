import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite-plus"

/**
 * `web-next` — the UX study, and the seed of the future main app.
 *
 * Same stack as `apps/web` (TanStack Start + Tailwind v4 + Effect atoms), built
 * to test the interaction design. The visual design is the flat-vector "poster"
 * language defined in `src/styles/app.css`: Corehalla's palette, applied to
 * outlined slabs, hard offset shadows and parallelogram controls.
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
 *
 * ## Why `publicDir` points next door
 *
 * The roster, weapon and region art is 13MB of third-party images that the
 * legacy client already ships. Serving that copy rather than a duplicate keeps
 * one source of truth, so a new legend's icon lands here the moment it lands
 * there. It is a deliberate cross-app reference, not an oversight: if `apps/web`
 * is ever retired, copy `public/` in beside this config and drop the override.
 */
const PORT = 3001

export default defineConfig({
    publicDir: fileURLToPath(new URL("../web/public", import.meta.url)),
    server: {
        port: PORT,
    },
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [tanstackStart(), viteReact(), tailwindcss()],
})
