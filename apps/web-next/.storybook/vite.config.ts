import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite-plus"

const src = fileURLToPath(new URL("../src/", import.meta.url))

/**
 * Storybook's own Vite config.
 *
 * A deliberately stripped-down twin of the app's `vite.config.ts`: React and
 * Tailwind only, no TanStack Start. Tailwind v4 reads the same
 * `src/styles/app.css` the app ships, so components render with the real
 * Corehalla skin rather than a Storybook-defined approximation.
 *
 * `publicDir` points next door for the same reason the app's does: the roster,
 * weapon and region art is real content, and a component that shows a legend
 * portrait should show one here too, not a broken image.
 *
 * The `@/` alias is declared here rather than left to `resolve.tsconfigPaths`:
 * Storybook loads this config through `loadConfigFromFile` directly, a path on
 * which Vite+ does not run its tsconfig-path resolution. A regex `find` keeps
 * it off scoped packages such as `@base-ui/react`.
 */
export default defineConfig({
    publicDir: fileURLToPath(new URL("../../web/public", import.meta.url)),
    resolve: {
        tsconfigPaths: true,
        alias: [{ find: /^@\//, replacement: src }],
    },
    plugins: [viteReact(), tailwindcss()],
})
