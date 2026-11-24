import { strict as effectStrict } from "@effect/tsgo/oxlint-presets"
import { defineConfig } from "vite-plus"

/**
 * Workspace root Vite+ configuration.
 *
 * Vite+ replaces the previous split tooling:
 * - Oxlint replaces ESLint (`.eslintrc.yml` is gone)
 * - Oxfmt replaces Prettier (`.prettierrc` is gone)
 * - Vite Task (`vp run`) replaces Turborepo (`turbo.json` is gone)
 *
 * Per-package `vite.config.ts` files still own their framework configuration
 * (see `apps/web/vite.config.ts`); this file owns the shared defaults.
 */
export default defineConfig({
    // `apps/web` (TanStack Start) and `apps/worker` are both present, so `vp dev`/
    // `vp build` need an explicit target.
    defaultPackage: {
        dev: "./apps/web",
        build: "./apps/web",
        preview: "./apps/web",
    },

    run: {
        tasks: {
            // `vp check` is the whole static gate: format, lint and type check.
            // The `effect-tsgo` wrapper is what makes its Oxlint run load the
            // patched binding that carries the Effect diagnostics.
            ci: {
                command: ["effect-tsgo vp check"],
                cache: false,
            },
        },
    },

    // Replaces the (unused) lint-staged setup with Vite+'s own staged-file
    // runner. This block is inert until the hook dispatcher is installed:
    //   vp hooks enable      # or `vp config`, which also runs from `prepare`
    // `vp staged` then runs this on every commit; `vp hooks disable` opts out.
    staged: {
        "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,json,jsonc,css,md,yml,yaml}":
            "effect-tsgo vp check --fix",
    },

    lint: {
        plugins: [
            "typescript",
            "react",
            "jsx-a11y",
            "unicorn",
            "oxc",
            // `@effect/tsgo` registers this plugin in the patched Oxlint
            // binding it launches. Its type augmentation is only applied by
            // `effect-tsgo patch`, which we do not run because it rewrites
            // `node_modules`, so the name needs a cast.
            "effecttsgo" as unknown as "oxc",
        ],
        options: {
            // Type checking and the type-aware rules run on Vite+'s tsrs, so
            // `vp check` is the only static gate. Run it through `effect-tsgo`
            // (`effect-tsgo vp check`) to get the Effect-patched tsrs and the
            // Effect rules below.
            typeAware: true,
            typeCheck: true,
        },
        categories: {
            correctness: "error",
            suspicious: "warn",
        },
        rules: {
            // `effect-tsgo`'s strict preset: every recommended Effect
            // diagnostic is an error, not a warning.
            ...effectStrict.rules,
            // Ported from the previous `.eslintrc.yml`.
            "no-console": "error",
            "no-var": "error",
            "object-shorthand": [
                "warn",
                "always",
                { avoidExplicitReturnArrows: true },
            ],
            "typescript/no-unused-vars": "error",
            // Unused `catch (e)` bindings are a common, intentional pattern in
            // this codebase (and across the third-party helpers we vendor).
            "no-unused-vars": [
                "error",
                {
                    caughtErrors: "none",
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "typescript/consistent-type-imports": [
                "error",
                { prefer: "type-imports" },
            ],
            // Automatic JSX runtime: React does not need to be in scope.
            "react/react-in-jsx-scope": "off",
            // Legacy components use function declarations and read state in
            // effects; keep these visible without failing the migration.
            "react/function-component-definition": [
                "warn",
                {
                    namedComponents: "arrow-function",
                    unnamedComponents: "arrow-function",
                },
            ],
            "react/set-state-in-effect": "warn",
            "react/static-components": "warn",
            "react-hooks/exhaustive-deps": "warn",
            "eslint/no-shadow": "off",
            "unicorn/no-array-sort": "off",
        },
        overrides: [
            {
                // Node-only packages may log to the console.
                files: [
                    "apps/worker/**",
                    "scripts/**",
                    "setup.zx.mjs",
                    "alchemy.run.ts",
                    "packages/db/**",
                    "packages/logger/**",
                    "packages/web-parser/**",
                    "packages/dl-roster-images/**",
                    "**/*.config.{js,ts,mjs,cjs}",
                ],
                env: { node: true },
                rules: { "no-console": "off" },
            },
            {
                // Feature flags are written as intentionally-constant
                // expressions (`false && __DEV && ...`) to disable a flag.
                files: ["apps/web/src/util/features.ts"],
                rules: { "no-constant-binary-expression": "off" },
            },
            {
                // Logger helpers intentionally use short-circuit expressions.
                files: ["packages/logger/**"],
                rules: { "no-unused-expressions": "off" },
            },
            {
                // The `effecttsgo` plugin name sits outside Vite+'s plugin
                // schema until `effect-tsgo patch` adds its augmentation.
                files: ["vite.config.ts"],
                rules: { "typescript/no-unsafe-type-assertion": "off" },
            },
        ],
        ignorePatterns: [
            "**/node_modules/**",
            "**/.output/**",
            "**/.vercel/**",
            "**/.nitro/**",
            "**/.turbo/**",
            "**/dist/**",
            "**/build/**",
            "**/out/**",
            // Generated by drizzle-kit and the TanStack Router plugin.
            "packages/db/drizzle/**",
            "apps/web/src/routeTree.gen.ts",
            "apps/web-next/src/routeTree.gen.ts",
            // Generated seed SQL (see packages/db/scripts/seed.mts).
            "packages/db/seed/generated/**",
            // Generated by EmDash on dev server start.
            "apps/cms/emdash-env.d.ts",
        ],
    },

    fmt: {
        // Ported from the previous `.prettierrc`.
        semi: false,
        printWidth: 80,
        trailingComma: "all",
        tabWidth: 4,
        sortPackageJson: false,
        ignorePatterns: [
            "**/node_modules/**",
            "**/.output/**",
            "**/.vercel/**",
            "**/.nitro/**",
            "**/.turbo/**",
            "**/dist/**",
            "**/build/**",
            "**/out/**",
            // Generated by drizzle-kit and the TanStack Router plugin.
            "packages/db/drizzle/**",
            "apps/web/src/routeTree.gen.ts",
            "apps/web-next/src/routeTree.gen.ts",
            "pnpm-lock.yaml",
            // Generated seed SQL (see packages/db/scripts/seed.mts).
            "packages/db/seed/generated/**",
            // Generated by EmDash on dev server start.
            "apps/cms/emdash-env.d.ts",
            // Oxfmt drops the `export {}` module marker, which would leave an
            // empty (script, not module) file.
            "packages/web-parser/index.ts",
        ],
    },
})
