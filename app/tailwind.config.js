// eslint-disable-next-line @typescript-eslint/no-var-requires
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
        },
    },
    plugins: [],
}
