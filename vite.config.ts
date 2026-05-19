import { defineConfig } from "vite-plus"

export default defineConfig({
    run: {
        cache: {
            scripts: false,
            tasks: true,
        },
    },
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
        options: {
            typeAware: true,
            typeCheck: true,
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
            "app/pages/_app.tsx",
            "app/pages/_error.tsx",
            "app/pages/404.tsx",
            "app/pages/500.tsx",
            "app/pages/api/**",
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
