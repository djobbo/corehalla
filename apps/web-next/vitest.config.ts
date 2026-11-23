import { defineConfig } from "vite-plus"

/**
 * Test configuration for the study app.
 *
 * A **separate** file from `vite.config.ts` on purpose. That one registers the
 * TanStack Start, React and Tailwind plugins for the app build, and none of them
 * are needed to test the pure modules under `src/lib` — loading them would make
 * a unit test depend on a router and a bundler plugin to check a string helper.
 * Vitest prefers `vitest.config.ts` when both exist, so the app build is
 * unaffected.
 *
 * The runner is the Vitest shipped inside the Vite+ CLI, so the script is
 * `vp test` and the declared `vitest` version stays the one that CLI uses.
 */
export default defineConfig({
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
})
