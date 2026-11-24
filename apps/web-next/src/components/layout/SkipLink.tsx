/**
 * The first control on every page. It is off-canvas until it takes focus, so it
 * costs nothing visually but gives a keyboard user one press past the masthead
 * and the section nav.
 *
 * It targets the page's `main`, which is why every `.ch-page` main carries
 * `id="main"` and `tabIndex={-1}` — the fragment move lands focus inside the
 * content, and the next Tab continues from there.
 */
export const SkipLink = () => (
    <a className="ch-skip" href="#main">
        Skip to content
    </a>
)
