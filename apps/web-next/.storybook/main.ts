import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-vite"

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = fileURLToPath(new URL("../../web/public/", import.meta.url))

/**
 * Storybook configuration for `web-next`.
 *
 * The app's own `vite.config.ts` registers the TanStack Start plugin, which
 * owns routing and the dev server. Neither belongs in the workshop, so
 * `builder.viteConfigPath` points Storybook at its own `vite.config.ts`
 * instead — the app config is never loaded.
 *
 * Stories live beside the components they document under
 * `src/components/<tier>/`, so the sidebar mirrors the component system.
 */
const config: StorybookConfig = {
    stories: ["../src/**/*.stories.@(ts|tsx)"],
    // The roster/weapon/region art the app ships. Storybook ignores the Vite
    // config's `publicDir`, so the same directory is registered here. Absolute,
    // because `staticDirs` resolves relative to the process cwd, not `.storybook`.
    staticDirs: [publicDir],
    addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
    framework: {
        name: "@storybook/react-vite",
        options: {
            builder: { viteConfigPath: resolve(here, "vite.config.ts") },
        },
    },
    // The repo runs TypeScript 7 (the native compiler), which
    // `react-docgen-typescript`'s Vite plugin cannot introspect. The Babel-based
    // `react-docgen` walks the same source without the TypeScript program API.
    typescript: {
        reactDocgen: "react-docgen",
    },
    core: {
        disableTelemetry: true,
    },
}

export default config
