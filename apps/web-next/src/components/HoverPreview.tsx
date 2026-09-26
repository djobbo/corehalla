import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { Link } from "@tanstack/react-router"
import { useEffect, useMemo } from "react"
import type { CSSProperties, ReactNode } from "react"
import { clanStatsAtom, playerRankedAtom, playerStatsAtom } from "@/effect/atoms"
import { hoveredAtom, previewAtom } from "@/effect/hover"
import type { PreviewTarget } from "@/effect/hover"
import { clanHref, playerHref } from "@/lib/rankings"
import { getFullLegends } from "@crh/bhapi/legends"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"

/**
 * Hover previews: a compact entity card shown when the pointer settles on a link.
 *
 * ## Why it is worth having
 *
 * The leaderboard's job is to answer "who is this?" before you commit to a page.
 * Without a preview the only way to find out is to leave, look, and come back —
 * and a ladder is browsed by scanning many names, so that cost is paid over and
 * over.
 *
 * ## Why it costs nothing
 *
 * The card reads the *same* atoms the destination page reads
 * (`playerStatsAtom`/`playerRankedAtom`/`clanStatsAtom`). Those are backed by
 * `Atom.family`, so the card is not a second data path: whatever it loads is the
 * entry the profile page then renders from, and the click is instant. A preview
 * that fetched its own summary shape would warm nothing and pay twice.
 *
 * ## Why it waits, and why it shows nothing on failure
 *
 * A preview is an optional extra, so it has no business drawing attention to
 * itself while it is empty. It appears only once it has real data to show, and
 * if that data never arrives — a failed request, an id with no record — it
 * renders nothing at all and the link simply stays a link. Silence is the
 * correct failure mode: the user has lost nothing, because hovering was never
 * how they navigate.
 *
 * That is also why the readiness check sits *above* the card shell rather than
 * inside it. A shell that rendered first and filled in later would put an empty
 * bordered box under the pointer, which is worse than nothing.
 *
 * ## Why it is not a panel
 *
 * This is deliberately additive. It never covers the thing you are reading and it
 * never changes the URL, so the page stays exactly where you left it — which is
 * the property the route-masked overlay failed to preserve for the price it
 * charged.
 */

const CARD_WIDTH = 300
const GAP = 6

/**
 * Rough height, used only to decide whether there is room below the link.
 *
 * Guessing here rather than measuring keeps the card out of a measure-then-place
 * cycle: an approximate flip is a far better failure than a card that jumps.
 */
const ESTIMATED_HEIGHT = 170

const cardStyle = (target: PreviewTarget): CSSProperties => {
    const left = Math.max(
        8,
        Math.min(target.left, window.innerWidth - CARD_WIDTH - 8),
    )
    const below = target.top + target.height + GAP
    const flip =
        below + ESTIMATED_HEIGHT > window.innerHeight &&
        target.top - GAP - ESTIMATED_HEIGHT > 0

    return flip
        ? { left, bottom: window.innerHeight - target.top + GAP }
        : { left, top: below }
}

/**
 * The preview layer. Mounted once, near the root, so any `EntityLink` anywhere
 * on any page can raise a card without the page knowing about it.
 */
export const HoverPreviewLayer = () => {
    const target = useAtomValue(previewAtom)
    const setHovered = useAtomSet(hoveredAtom)

    // Position is captured when the pointer enters, so a scroll or a resize
    // makes the card describe a place the link no longer occupies — and nothing
    // re-fires `mouseenter` to correct it. Hiding is the honest response.
    useEffect(() => {
        if (target === null) return

        const hide = () => setHovered(null)

        window.addEventListener("scroll", hide, {
            capture: true,
            passive: true,
        })
        window.addEventListener("resize", hide)

        return () => {
            window.removeEventListener("scroll", hide, { capture: true })
            window.removeEventListener("resize", hide)
        }
    }, [target, setHovered])

    if (target === null) return null

    // Entering the card re-asserts the hover, which is what keeps it open while
    // the pointer crosses the gap and lands on it. Leaving clears it, and the
    // same debounce that delayed the appearance gives it a grace period.
    const keepAlive = () => setHovered(target)
    const release = () => setHovered(null)

    // Keyed per entity so the atom hooks below re-run for the new id rather than
    // a card mutating in place from one player to the next.
    const key = `${target.type}:${target.id}`

    return target.type === "player" ? (
        <PlayerPreview
            key={key}
            target={target}
            onEnter={keepAlive}
            onLeave={release}
        />
    ) : (
        <ClanPreview
            key={key}
            target={target}
            onEnter={keepAlive}
            onLeave={release}
        />
    )
}

// --- shared shell ----------------------------------------------------------

/**
 * Everything that is true of a card regardless of what it says. It is only ever
 * rendered by a card that has already decided it has something to show.
 */
const CardShell = ({
    target,
    onEnter,
    onLeave,
    children,
}: {
    readonly target: PreviewTarget
    readonly onEnter: () => void
    readonly onLeave: () => void
    readonly children: ReactNode
}) => {
    const href: string =
        target.type === "player" ? playerHref(target.id) : clanHref(target.id)

    return (
        <Link
            to={href}
            style={{ width: CARD_WIDTH, ...cardStyle(target) }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="pointer-events-auto fixed z-40 block rounded-lg border border-bg bg-bgVar2 p-3 text-sm shadow-lg"
        >
            {children}
        </Link>
    )
}

type CardProps = {
    readonly target: PreviewTarget
    readonly onEnter: () => void
    readonly onLeave: () => void
}

// --- player ----------------------------------------------------------------

const PlayerPreview = ({ target, onEnter, onLeave }: CardProps) => {
    const playerId = Number(target.id)

    const statsResult = useAtomValue(
        useMemo(() => playerStatsAtom(playerId), [playerId]),
    )
    const rankedResult = useAtomValue(
        useMemo(() => playerRankedAtom(playerId), [playerId]),
    )

    // Reading the atoms is what starts the requests, and it happens here even
    // though the component renders nothing — so the data is already in the
    // registry by the time the card is allowed to appear.
    if (statsResult._tag !== "Success" || rankedResult._tag !== "Success") {
        return null
    }

    const stats = statsResult.value
    const ranked = rankedResult.value

    // Both requests answered, and both say there is no such player. There is
    // nothing to preview, so nothing is previewed.
    if (stats === null && ranked === null) return null

    const name = cleanString(stats?.name ?? ranked?.name ?? "")

    const main =
        stats === null
            ? null
            : (getFullLegends(stats.legends, ranked?.legends)
                  .filter((legend) => (legend.stats?.games ?? 0) > 0)
                  .sort(
                      (a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0),
                  )[0] ?? null)

    return (
        <CardShell target={target} onEnter={onEnter} onLeave={onLeave}>
            <div className="flex flex-col gap-1.5">
                <p className="font-semibold">{name}</p>

                {ranked ? (
                    <Row
                        label="1v1"
                        value={`${ranked.rating} · ${
                            ranked.tier ?? "Unranked"
                        } · ${String(ranked.region).toUpperCase()}${
                            ranked.global_rank > 0
                                ? ` · #${ranked.global_rank}`
                                : ""
                        }`}
                    />
                ) : (
                    <p className="text-xs text-textVar1">
                        No 1v1 ranked record.
                    </p>
                )}

                {stats ? (
                    <Row label="Account" value={`Level ${stats.level}`} />
                ) : null}

                {main ? (
                    <Row
                        label="Main"
                        value={`${main.bio_name} · level ${
                            main.stats?.level ?? 0
                        }`}
                    />
                ) : null}

                {stats?.clan ? (
                    <Row label="Clan" value={cleanString(stats.clan.clan_name)} />
                ) : null}
            </div>
        </CardShell>
    )
}

// --- clan ------------------------------------------------------------------

const ClanPreview = ({ target, onEnter, onLeave }: CardProps) => {
    const clanId = Number(target.id)

    const result = useAtomValue(useMemo(() => clanStatsAtom(clanId), [clanId]))

    if (result._tag !== "Success" || result.value === null) return null

    const clan = result.value
    const members = [...clan.clan].sort((a, b) => b.xp - a.xp)

    return (
        <CardShell target={target} onEnter={onEnter} onLeave={onLeave}>
            <div className="flex flex-col gap-1.5">
                <p className="font-semibold">
                    {cleanString(clan.clan_name)}
                </p>
                <Row
                    label="Clan XP"
                    value={Number(clan.clan_xp).toLocaleString()}
                />
                <Row
                    label="Members"
                    value={`${clan.clan.length} · created ${formatUnixTime(
                        clan.clan_create_date,
                    )}`}
                />
                {members.length > 0 ? (
                    <div className="flex flex-col gap-0.5 border-t border-bg pt-1.5">
                        <span className="text-xs text-textVar1">
                            Top members
                        </span>
                        {members.slice(0, 3).map((member) => (
                            <span
                                key={member.brawlhalla_id}
                                className="text-xs"
                            >
                                {/* `?? ""` for the same reason as the clan
                                    roster: the key can be absent on the wire,
                                    and `cleanString(undefined)` is the literal
                                    text "undefined". */}
                                {cleanString(member.name ?? "") ||
                                    `#${member.brawlhalla_id}`}{" "}
                                · {member.xp.toLocaleString()} XP
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </CardShell>
    )
}

// --- shared ----------------------------------------------------------------

const Row = ({
    label,
    value,
}: {
    readonly label: string
    readonly value: string
}) => (
    <div className="flex gap-2">
        <span className="w-16 shrink-0 text-xs text-textVar1">{label}</span>
        <span className="flex-1 text-xs">{value}</span>
    </div>
)
