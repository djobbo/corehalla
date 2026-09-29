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

const setColor =
    (prop: string) => (color: keyof (typeof theme)["colors"], state?: string) =>
        css(
            state
                ? { [state]: { [prop]: theme.colors[color] } }
                : { [prop]: theme.colors[color] },
        )()

export const bg = setColor("backgroundColor")
export const text = setColor("color")
export const border = setColor("borderColor")
