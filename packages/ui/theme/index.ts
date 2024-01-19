import { createStitches } from "@stitches/react"
import colors from "./theme"

export const {
    styled,
    css,
    globalCss,
    keyframes,
    getCssText,
    theme,
    createTheme,
    config,
} = createStitches({
    theme: {
        colors,
    },
})
