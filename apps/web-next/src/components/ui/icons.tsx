import type { SVGProps } from "react"

/**
 * The account surface's glyphs, inline.
 *
 * Two shapes do not justify a dependency: the app already renders its marks and
 * chips from CSS, and an icon package would be the only thing in the bundle
 * that needs a tree-shaking story. Both take their colour from `currentColor`,
 * so a chip's active and idle states colour them for free.
 */

type IconProps = SVGProps<SVGSVGElement> & {
    readonly filled?: boolean
}

export const HeartIcon = ({ filled = false, ...props }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        aria-hidden
        focusable="false"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
)

export const SignOutIcon = (props: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        aria-hidden
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
    </svg>
)
