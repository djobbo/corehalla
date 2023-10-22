/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
    locales: ["en", "fr", "pseudo-LOCALE"],
    pseudoLocale: "pseudo-LOCALE",
    sourceLocale: "en",
    fallbackLocales: {
        "pseudo-LOCALE": "en",
    },
    catalogs: [
        {
            path: "<rootDir>/i18n/locales/{locale}",
            include: [
                "app/**/*",
                "pages/**/*",
                "components/**/*",
                "lib/**/*",
                "../packages/ui/theme/**/*",
                "../packages/ui/base/**/*",
            ],
        },
    ],
    format: "po",
}
