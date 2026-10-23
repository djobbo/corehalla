import type { ReactNode } from "react"
import type { ClanRank } from "@crh/bhapi/constants"

const glyphs: Record<ClanRank, ReactNode> = {
    Leader: (
        <>
            <polygon points="3,15 3,6 8,10.5 12,4 16,10.5 21,6 21,15" />
            <rect x="3" y="16.5" width="18" height="2.5" />
        </>
    ),
    Officer: (
        <polygon points="12,2 14.6,9.4 22,12 14.6,14.6 12,22 9.4,14.6 2,12 9.4,9.4" />
    ),
    Member: (
        <>
            <circle cx="12" cy="7.5" r="4" />
            <path d="M3.5 20.5c0-4.1 3.8-6.5 8.5-6.5s8.5 2.4 8.5 6.5H3.5z" />
        </>
    ),
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
        <span className="sr-only">{rank} of this clan</span>
    </span>
)
