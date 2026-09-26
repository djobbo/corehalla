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
 * ## There is no API proxy here, on purpose
 *
 * The browser calls the API at an absolute origin supplied by the deployment as
 * `VITE_API_ORIGIN`. Under `alchemy dev` that is the API worker's own resolved
 * URL, so the port Alchemy happens to assign never appears in a file.
 *
 * An earlier version proxied `/api/v1/*` instead, which avoided the cross-origin
 * hop but cost two things that mattered more: the proxy target had to be written
 * down as a literal port, and the browser then took a *different* path in dev
 * than in production — so a CORS mistake could only ever surface after a deploy.
 * Calling the origin directly means both environments exercise the same path.
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
