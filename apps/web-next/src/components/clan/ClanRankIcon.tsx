import type { ReactNode } from "react"
import type { ClanRank } from "@crh/bhapi/constants"

/**
 * A clan member's standing, as the glyph on the left end of their nameplate.
 *
 * Four shapes rather than one, because "in this clan" is not a single thing: a
 * leader, an officer, a member and a recruit are four levels of standing, and a
 * generic person would flatten them into each other. The legacy app drew the
 * same four from `react-icons`; these are inline so the new app does not take a
 * dependency on an entire icon set for four shapes.
 *
 * The rank is deliberately *not* printed beside the glyph. That is the same
 * call the team card made about its region flag and the tier chip: the art is
 * the statement, and spelling it out next to itself adds nothing. The rank is
 * still fully available to a reader who cannot see which shape is which — a
 * visually hidden label and a `title` carry it — which for a set this small is
 * most people the first time they meet it.
 */

const glyphs: Record<ClanRank, ReactNode> = {
    /* A crown on a band — the clan's owner. */
    Leader: (
        <>
            <polygon points="3,15 3,6 8,10.5 12,4 16,10.5 21,6 21,15" />
            <rect x="3" y="16.5" width="18" height="2.5" />
        </>
    ),

    /* A four-point star, which stays legible where a five-point one clogs. */
    Officer: (
        <polygon points="12,2 14.6,9.4 22,12 14.6,14.6 12,22 9.4,14.6 2,12 9.4,9.4" />
    ),

    Member: (
        <>
            <circle cx="12" cy="7.5" r="4" />
            <path d="M3.5 20.5c0-4.1 3.8-6.5 8.5-6.5s8.5 2.4 8.5 6.5H3.5z" />
        </>
    ),

    /*
     * The member glyph, narrowed and shifted left, plus a plus in the corner
     * that frees up. The two shapes never meet: the plus occupies y 3–12, and
     * the body does not begin until y 14.2.
     */
    Recruit: (
        <>
            <circle cx="9" cy="7" r="3.5" />
            <path d="M1.5 20c0-3.7 3.4-5.8 7.5-5.8s7.5 2.1 7.5 5.8H1.5z" />
            <path d="M17.5 3h2v3.5H23v2h-3.5V12h-2V8.5H14v-2h3.5V3z" />
        </>
    ),
}

export const ClanRankIcon = ({ rank }: { readonly rank: ClanRank }) => (
    <span className="ch-nameplate-rank" title={rank}>
        <svg viewBox="0 0 24 24" aria-hidden focusable="false">
            {glyphs[rank]}
        </svg>
        {/*
         * The glyph is `aria-hidden` because it says nothing a screen reader
         * can read: four untitled shapes. So the rank is stated in text — but
         * hidden, not printed. A visible label beside the icon would be exactly
         * the repetition the rest of the card avoids, and `role="img"` with an
         * `aria-label` would say the same thing only by claiming the glyph is
         * an image it is not.
         */}
        <span className="sr-only">{rank} of this clan</span>
    </span>
)
