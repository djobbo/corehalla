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
 * (see `web/vite.config.ts`); this file owns the shared defaults.
 */
export default defineConfig({
    // `app/` (legacy Next.js), `web/` (TanStack Start) and `worker/` are all
    // present, so `vp dev`/`vp build` need an explicit target.
    defaultPackage: {
        dev: "./web",
        build: "./web",
        preview: "./web",
    },

    run: {
        tasks: {
            // Composite CI verification. Uses the built-in check pipeline plus
            // every package's type check.
            ci: {
                command: ["vp check", "vp run -r ts:check"],
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
            "vp check --fix",
    },

    lint: {
        plugins: ["typescript", "react", "jsx-a11y", "unicorn", "oxc"],
        options: {
            // Vite+ recommends `typeAware: true` + `typeCheck: true` so that
            // `vp check` is the single static-check command. Both stay off
            // here for two reasons:
            //
            // 1. `web` must be checked by the Effect-patched compiler
            //    (`@effect/tsgo`), which only its own `ts:check` script
            //    installs; tsgolint would check it with a stock toolchain.
            // 2. tsgolint (TypeScript 7) rejects the legacy `app`/`worker`
            //    tsconfigs, which still use `es5`, `moduleResolution: node10`,
            //    `downlevelIteration` and a `baseUrl`-relative `paths` map.
            //
            // Type checking is composed per package instead, via
            // `vp run -r ts:check` (see the root `ts:check` script and the
            // `run.tasks.ci` task below).
            typeAware: false,
            typeCheck: false,
        },
        categories: {
            correctness: "error",
            suspicious: "warn",
        },
        rules: {
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
            // Use the shared link component rather than Next's.
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        { name: "next/link", message: "Use ui/base/AppLink" },
                    ],
                },
            ],
        },
        overrides: [
            {
                // Node-only packages may log to the console.
                files: [
                    "worker/**",
                    "scripts/**",
                    "setup.zx.mjs",
                    "packages/server/**",
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
                files: ["app/util/features.ts", "web/src/util/features.ts"],
                rules: { "no-constant-binary-expression": "off" },
            },
            {
                // Logger helpers intentionally use short-circuit expressions.
                files: ["packages/logger/**"],
                rules: { "no-unused-expressions": "off" },
            },
        ],
        ignorePatterns: [
            "**/node_modules/**",
            "**/.next/**",
            "**/.output/**",
            "**/.vercel/**",
            "**/.nitro/**",
            "**/.turbo/**",
            "**/dist/**",
            "**/build/**",
            "**/out/**",
            // Generated by drizzle-kit and by Next.js/the TanStack Router plugin.
            "packages/db/drizzle/**",
            "app/next-env.d.ts",
            "web/src/routeTree.gen.ts",
            // Supabase CLI scratch state (also covered by `supabase/.gitignore`).
            "supabase/.temp/**",
            "supabase/.branches/**",
            ".repos/**",
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
            "**/.next/**",
            "**/.output/**",
            "**/.vercel/**",
            "**/.nitro/**",
            "**/.turbo/**",
            "**/dist/**",
            "**/build/**",
            "**/out/**",
            // Generated by drizzle-kit and by Next.js/the TanStack Router plugin.
            "packages/db/drizzle/**",
            "app/next-env.d.ts",
            "web/src/routeTree.gen.ts",
            "pnpm-lock.yaml",
            // Supabase CLI scratch state (also covered by `supabase/.gitignore`).
            "supabase/.temp/**",
            "supabase/.branches/**",
            ".repos/**",
            // Oxfmt drops the `export {}` module marker, which would leave an
            // empty (script, not module) file.
            "packages/web-parser/index.ts",
        ],
    },
})
