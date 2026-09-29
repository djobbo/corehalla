import { Card, CardContent } from "@/components/ui/card"
import { SplitProgress } from "@/components/SplitProgress"
import { EntityLink } from "@/components/EntityLink"
import { ClanRankIcon } from "./ClanRankIcon"
import { playerHref } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { GuildMember } from "@crh/api-contract/schemas"
import type { ClanRank } from "@crh/bhapi/constants"

/**
 * One clan member, on the 2v2 team card's template.
 *
 * A clan roster is a set of people, and the app already has a card for "one
 * person-shaped thing with a name, a headline figure and a share of a whole":
 * the team card. Reusing its arrangement rather than inventing a second one is
 * what makes a clan page and a player page feel like the same product — the
 * plate, the big figure, the split bar and the two-sided row all land in the
 * same place.
 *
 * Two things are substituted, and both for the same reason — a member is one
 * person, not a pair with a ranked record:
 *
 * - The plate's flag slot holds the member's **rank** instead of a region. A
 *   member has no region to show; their standing in the clan is what belongs
 *   there.
 * - The win/loss bar becomes their **share of the clan's XP**. It is the same
 *   kind of quantity — this member's part of a whole the clan owns — so the bar
 *   is drawn against `total`, which leaves the clan's remaining XP as the
 *   hollow slot rather than stretching one member's slice to fill the bar and
 *   implying they earned all of it.
 *
 * The row under the bar pairs the two things a member contributes, which is
 * what the team card's win/loss pair is doing in the same place: their **share
 * of the clan's XP**, and their **guild points**. Those are separate figures
 * rather than two views of one — XP levels the clan, points are its score — so
 * a member can lead on either. The join date sits below them as a caption
 * because it is the one fact here that is not a contribution.
 */
export const MemberCard = ({
    member,
    clanXp,
}: {
    readonly member: GuildMember
    readonly clanXp: number
}) => {
    const share = percent(member.xp, clanXp)

    /*
     * Dropped, not zeroed, when absent. Only the legacy upstream omits it, and
     * a clan with no points figure should show four facts rather than a
     * fabricated fifth — see `GuildMember.guild_points`. A real zero *is*
     * shown, because "nobody in this clan has earned points" is a fact about
     * the clan and not a missing number.
     */
    const points = member.guild_points

    return (
        <Card className="overflow-visible py-0">
            {/*
             * `py-0` and a single `CardContent` because the plate below is inset
             * against this card's edge, not against a padded column: the old card
             * was one `p-4` box, and the shadcn `Card` splits that into its own
             * block padding plus the content's inline padding. `overflow-visible`
             * because `ch-nameplate` hangs off the left edge with its shadow — the
             * card's default clip would cut both away.
             */}
            <CardContent className="p-4">
                {/*
                 * `ch-nameplate-wide` because this card has no ranked banner in its
                 * corner — the default plate reserves room for one, which here
                 * would only wrap long names early.
                 */}
                <div className="ch-nameplate ch-nameplate-wide">
                    <ClanRankIcon rank={member.rank as ClanRank} />
                    <div className="ch-nameplate-names">
                        <EntityLink
                            type="player"
                            id={member.id}
                            href={playerHref(member.slug)}
                            className="transition-colors hover:text-ring"
                        >
                            {/*
                             * v1 intermittently omits a member's name, and the
                             * mapper normalises that to `""` so the type stays
                             * honest. Rendering it would make the plate an empty —
                             * but still clickable — link, so the id stands in. The
                             * profile it points at resolves, which is why the
                             * member is worth showing at all.
                             */}
                            {cleanString(member.name) || `#${member.id}`}
                        </EntityLink>
                    </div>
                </div>

                {/*
                 * The headline figure, with the clan's total beside it. It is the
                 * same "mine against the whole" shape the team card uses for elo
                 * against peak elo, and it is what makes the percentage below
                 * checkable by eye rather than a number on its own.
                 */}
                <p className="ch-display mt-2 text-2xl">
                    {member.xp.toLocaleString()}
                    <span className="ml-2 text-xs font-normal tracking-normal text-muted-foreground">
                        / {clanXp.toLocaleString()} XP
                    </span>
                </p>

                <SplitProgress
                    className="mt-2"
                    total={clanXp}
                    parts={[{ key: "xp", value: member.xp, intent: "blue" }]}
                />

                {/*
                 * The two contributions, as the bold pair the team card puts in
                 * this position. `flex-wrap` so the pair stacks rather than
                 * overflowing when the card is narrow — a member card has no
                 * banner, so it has no other reason to be short of room.
                 */}
                <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm font-bold">
                    <span className="whitespace-nowrap">
                        {share.toFixed(2)}%{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            of clan XP
                        </span>
                    </span>
                    {points === undefined ? null : (
                        <span className="whitespace-nowrap">
                            {points.toLocaleString()}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                                guild points
                            </span>
                        </span>
                    )}
                </div>

                {/*
                 * Lighter and on its own line, deliberately: this is the one figure
                 * on the card that is not a contribution, and the sort control is
                 * where a reader goes when the date is what they came for.
                 */}
                <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                    joined {formatUnixTime(member.joined_at)}
                </p>
            </CardContent>
        </Card>
    )
}
