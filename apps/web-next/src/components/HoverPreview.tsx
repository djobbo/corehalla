import { useAtomValue } from "@effect/atom-react"
import { Link } from "@tanstack/react-router"
import { useMemo } from "react"
import {
    clanStatsAtom,
    playerRankedAtom,
    playerStatsAtom,
} from "@/effect/atoms"
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
 * ## Why it is one component and not a layer
 *
 * This used to be a *single* preview layer mounted near the root: `EntityLink`
 * raised the hovered link's viewport rectangle into an atom, and one component
 * positioned a fixed card against it. That existed to keep the work bounded —
 * one card, one set of requests, however many rows are on screen — and it paid
 * for it by owning the open delay, the grace period, the scroll dismissal and
 * the positioning by hand.
 *
 * The bounded work is now shadcn's `HoverCard` placed *per link* by
 * `EntityLink`, and it stays bounded for a different reason: the popup's
 * children are not mounted until the card opens, so only the link the pointer is
 * actually on ever reads these atoms. What this module owns is what the card
 * *says*; the `HoverCard` owns when it appears.
 *
 * ## Why it shows nothing on failure
 *
 * A preview is an optional extra, so it has no business drawing attention to
 * itself while it is empty. It appears only once it has real data to show, and
 * if that data never arrives — a failed request, an id with no record — it
 * renders nothing at all and the link simply stays a link. The `empty:hidden` on
 * the popup in `EntityLink` is the other half of that contract: this module
 * returns `null`, and the empty popup is hidden rather than drawn as a bare
 * panel.
 *
 * That is also why the readiness check sits *above* the card rather than inside
 * it. A shell that rendered first and filled in later would put an empty
 * bordered box under the pointer, which is worse than nothing.
 *
 * ## Why it is not a panel
 *
 * This is deliberately additive. It never covers the thing you are reading and it
 * never changes the URL, so the page stays exactly where you left it — which is
 * the property the route-masked overlay failed to preserve for the price it
 * charged.
 */

/** Which card to show. The `id` arrives as a string from the row's data. */
export const EntityPreview = ({
    type,
    id,
}: {
    readonly type: "player" | "clan"
    readonly id: string
}) =>
    type === "player" ? (
        <PlayerPreview playerId={Number(id)} />
    ) : (
        <ClanPreview clanId={Number(id)} />
    )

// --- player ----------------------------------------------------------------

const PlayerPreview = ({ playerId }: { readonly playerId: number }) => {
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
                  .sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0))[0] ??
              null)

    return (
        /*
         * The whole card is the link, so a preview you have decided you want is
         * one click away rather than a thing you must leave and re-find. The
         * `HoverCard` keeps it open while the pointer crosses into it.
         */
        <Link to={playerHref(playerId)} className="flex flex-col gap-1.5">
            <div>
                <p className="ch-kicker">Player</p>
                <p className="ch-display mt-0.5 text-base">{name}</p>
            </div>

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
                <p className="text-xs text-muted-foreground">
                    No 1v1 ranked record.
                </p>
            )}

            {stats ? (
                <Row label="Account" value={`Level ${stats.level}`} />
            ) : null}

            {main ? (
                <Row
                    label="Main"
                    value={`${main.bio_name} · level ${main.stats?.level ?? 0}`}
                />
            ) : null}

            {stats?.clan ? (
                <Row label="Clan" value={cleanString(stats.clan.clan_name)} />
            ) : null}
        </Link>
    )
}

// --- clan ------------------------------------------------------------------

const ClanPreview = ({ clanId }: { readonly clanId: number }) => {
    const result = useAtomValue(useMemo(() => clanStatsAtom(clanId), [clanId]))

    if (result._tag !== "Success" || result.value === null) return null

    const clan = result.value
    const members = [...clan.clan].sort((a, b) => b.xp - a.xp)

    return (
        <Link to={clanHref(clanId)} className="flex flex-col gap-1.5">
            <div>
                <p className="ch-kicker">Clan</p>
                <p className="ch-display mt-0.5 text-base">
                    {cleanString(clan.clan_name)}
                </p>
            </div>

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
                <div className="flex flex-col gap-0.5 border-t border-border pt-1.5">
                    <span className="ch-kicker">Top members</span>
                    {members.slice(0, 3).map((member) => (
                        <span key={member.brawlhalla_id} className="text-xs">
                            {/* `?? ""` for the same reason as the clan roster:
                                the key can be absent on the wire, and
                                `cleanString(undefined)` is the literal text
                                "undefined". */}
                            {cleanString(member.name ?? "") ||
                                `#${member.brawlhalla_id}`}{" "}
                            · {member.xp.toLocaleString()} XP
                        </span>
                    ))}
                </div>
            ) : null}
        </Link>
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
        <span className="w-16 shrink-0 text-[0.6rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            {label}
        </span>
        <span className="flex-1 text-xs">{value}</span>
    </div>
)
