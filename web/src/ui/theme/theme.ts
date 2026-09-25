/**
 * Corehalla design tokens.
 *
 * Converted from the CommonJS `theme.js` (which used `module.exports`) to an
 * ES module: Vite's dev-mode SSR evaluates modules as ESM and cannot run
 * `module.exports`. Named exports are kept so existing `import { bgVar1 }`
 * call sites continue to work, and the default export matches the previous
 * `require("ui/theme/theme")` shape.
 *
 * The same values are also declared in `src/styles/app.css` for Tailwind v4.
 */
export const colors = {
    bgVar2: "#1A1B23",
    bgVar1: "#1E212C",
    bg: "#2B3043",
    bgLanding: "#1A1B23AA",
    textVar1: "#CCD0D6",
    text: "#FFFFFF",
    accent: "#3861FB",
    accentVar1: "#2095F2",
    success: "#24CD7C",
    danger: "#ED7853",
    warning: "#F3DA57",
    accentAlt: "#E568D9",
    accentAltVar1: "#FF99E9",
} as const

export const {
    bgVar2,
    bgVar1,
    bg,
    bgLanding,
    textVar1,
    text,
    accent,
    accentVar1,
    success,
    danger,
    warning,
    accentAlt,
    accentAltVar1,
} = colors

export default colors
