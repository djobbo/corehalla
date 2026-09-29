/**
 * The Corehalla mark, with its centre turning.
 *
 * A port of the legacy client's `ui/base/AnimatedLogo`, paths and accent fills
 * unchanged: it is the same logo, and the loading state is the one moment both
 * apps should be indistinguishable. Only the mechanism differs — the legacy
 * version is written with stitches (`keyframes` + `styled("g")`), and this app
 * has no stitches theme, so the rotation lives in `app.css` as `.ch-logo-center`
 * and the component stays a plain SVG.
 *
 * There is deliberately no `size` prop. How big the mark is belongs to whatever
 * is animating it, not to the mark: the page loader owns its size through
 * `.ch-pageloader-mark`, and a second caller should own its own.
 */
export const AnimatedLogo = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 436.48"
        className={className}
        aria-hidden
        focusable="false"
    >
        <path
            d="M445,987.05l14.69,14.69a23.87,23.87,0,0,1,.12,33.72l-.34.34a23.87,23.87,0,0,1-33.72-.12l-29.22-29.22-34.2-34.2a176,176,0,0,0-64.26-311.2A23.82,23.82,0,0,1,280,637.87v-.16a23.92,23.92,0,0,1,29.59-23.25C407.43,638.47,480,726.76,480,832a223,223,0,0,1-38,124.87A23.86,23.86,0,0,0,445,987.05Z"
            transform="translate(-32 -613.76)"
            fill="#ffffff"
        />
        <path
            d="M115.74,725.68a176,176,0,0,0,98.2,277.26A23.82,23.82,0,0,1,232,1026.13v.16a23.92,23.92,0,0,1-29.59,23.25C104.57,1025.53,32,937.24,32,832A223,223,0,0,1,81.54,691.48a226.9,226.9,0,0,1,33.94-33.94,223.15,223.15,0,0,1,86.83-43.06A23.94,23.94,0,0,1,232,637.71v.16a24,24,0,0,1-18.27,23.24,176.28,176.28,0,0,0-98,64.57Z"
            transform="translate(-32 -613.76)"
            fill="#ffffff"
        />

        {/* The turning piece: only the centre rotates, the two arms hold still. */}
        <g className="ch-logo-center">
            <path
                d="M267.37,959.5c-3.39.3-6.83.47-10.29.5-70.54.58-128.7-56.76-129.08-127.31A128,128,0,0,1,188.84,723,23.86,23.86,0,0,1,224,735.84l.08.25a24,24,0,0,1-10.28,28,80,80,0,0,0,38.64,147.86,82.64,82.64,0,0,0,10.93-.25A23.79,23.79,0,0,1,288,927.9l.08.25A23.91,23.91,0,0,1,267.37,959.5Z"
                transform="translate(-32 -613.76)"
                fill="#2196f3"
            />
            <path
                d="M384,832q0,5.73-.5,11.34a23.91,23.91,0,0,1-31.35,20.71l-.25-.08a24,24,0,0,1-16.21-24.91q.31-3.49.31-7.06a80,80,0,0,0-61.66-77.89A24,24,0,0,1,256,730.63h0a23.91,23.91,0,0,1,29.44-23.23A128.06,128.06,0,0,1,384,832Z"
                transform="translate(-32 -613.76)"
                fill="#f44336"
            />
        </g>
    </svg>
)
