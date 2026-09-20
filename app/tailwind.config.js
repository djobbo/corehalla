// oxlint-disable-next-line typescript/no-require-imports
const colors = require("ui/theme/theme")

module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "../packages/ui/theme/**/*.{js,ts,jsx,tsx}",
        "../packages/ui/base/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors,
            screens: {
                hashover: { raw: "(hover: hover)" },
            },
        },
    },
    plugins: [],
}
