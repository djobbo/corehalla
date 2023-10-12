module.exports = {
    root: true,
    extends: [
        "next/core-web-vitals",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jsx-a11y/strict",
    ],
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "jsx-a11y",
        "sort-imports-es6-autofix",
        "prettier",
    ],
    settings: {
        next: {
            rootDir: ["app/", "packages/*/"],
        },
    },
    rules: {
        "no-console": "error",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "prettier/prettier": "error",
        "no-var": "error",
        "sort-imports-es6-autofix/sort-imports-es6": [
            "error",
            {
                ignoreCase: false,
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
            },
        ],
        "@typescript-eslint/consistent-type-imports": [
            "error",
            {
                prefer: "type-imports",
                fixStyle: "inline-type-imports",
            },
        ],
        "object-shorthand": [
            2,
            "always",
            {
                avoidExplicitReturnArrows: true,
            },
        ],
    },
}
