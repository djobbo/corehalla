import { defineConfig } from "vite-plus"

export default defineConfig({
    staged: {
        "*.{js,ts,tsx,md,yaml,yml}": "vp check --fix",
    },
    fmt: {
        semi: false,
        printWidth: 80,
        trailingComma: "all",
        tabWidth: 4,
        ignorePatterns: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.output/**",
            "**/routeTree.gen.ts",
            "pnpm-lock.yaml",
        ],
        sortImports: {
            groups: [
                ["type-import"],
                ["type-builtin", "value-builtin"],
                [
                    "type-external",
                    "value-external",
                    "type-internal",
                    "value-internal",
                ],
                [
                    "type-parent",
                    "type-sibling",
                    "type-index",
                    "value-parent",
                    "value-sibling",
                    "value-index",
                ],
                ["unknown"],
            ],
            newlinesBetween: true,
            order: "asc",
        },
    },
    lint: {
        plugins: ["typescript", "react", "jsx-a11y"],
        // tsgolint does not support app/tsconfig baseUrl or legacy moduleResolution: node;
        // use `pnpm ts:check` (tsc) for type checking.
        options: {
            typeAware: false,
            typeCheck: false,
        },
        rules: {
            "no-console": "error",
            "no-var": "error",
            "typescript/no-unused-vars": "error",
            "typescript/consistent-type-imports": [
                "error",
                { prefer: "type-imports" },
            ],
            "object-shorthand": ["error", "always"],
        },
        ignorePatterns: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.output/**",
            "**/routeTree.gen.ts",
        ],
        overrides: [
            {
                files: ["packages/logger/**"],
                rules: {
                    "no-console": "off",
                },
            },
        ],
    },
})
