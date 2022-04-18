import { blueDark, grayDark, greenDark, redDark } from "@radix-ui/colors"
import { createStitches } from "@stitches/react"

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
        colors: {
            ...grayDark,
            ...blueDark,
            ...redDark,
            ...greenDark,
        },
    },
})

const setColor =
    (prop: string) => (color: keyof typeof theme["colors"], state?: string) =>
        css(
            state
                ? { [state]: { [prop]: theme.colors[color] } }
                : { [prop]: theme.colors[color] },
        )()

export const bg = setColor("backgroundColor")
export const text = setColor("color")
export const border = setColor("borderColor")
