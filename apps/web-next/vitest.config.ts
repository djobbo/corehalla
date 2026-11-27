import { defineConfig } from "vite-plus"
import { fileURLToPath } from "node:url"

/**
 * Test configuration for the study app.
 *
 * A **separate** file from `vite.config.ts` on purpose. That one registers the
 * TanStack Start, React and Tailwind plugins for the app build, and the unit
 * tests under `src` do not need them. The `@` alias is restated here because
 * `legacyRedirects.test.ts` imports the generated route tree — the route modules
 * it pulls in resolve `@/` — and the app build's alias lives in the other file.
 * Vitest prefers `vitest.config.ts` when both exist, so the app build is
 * unaffected.
 *
 * The runner is the Vitest shipped inside the Vite+ CLI, so the script is
 * `vp test` and the declared `vitest` version stays the one that CLI uses.
 */
export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
})
