// eslint-disable-next-line @typescript-eslint/no-var-requires
const { blueDark, greenDark, redDark } = require("@radix-ui/colors")

module.exports = {
    ...blueDark,
    success: greenDark.green9,
    danger: redDark.red9,
}
