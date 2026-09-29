import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { guildLevel } from "./guild-levels"
import type { Clan } from "@crh/bhapi/types"
import type { GuildEnvelope } from "@crh/api-contract/schemas"

/**
 * Assembles the guild page from the two upstream calls the gateway already
 * joined into one `Clan`.
 *
 * What this adds over the raw endpoint is the derived half: the level, the
 * progress toward the next one, lifetime XP, and each member's URL segment.
 * Nothing here needs a network, which is why it is a pure function of the clan
 * and the clock.
 */
export const buildGuild = (
    clan: Clan,
    updatedAt: number,
): GuildEnvelope => {
    const xp = Number.parseInt(clan.clan_xp, 10)
    const { level, xpPercentage } = guildLevel(xp)

    return {
        data: {
            id: clan.clan_id,
            name: clan.clan_name,
            slug: getEntitySlug(clan.clan_id, clan.clan_name),
            created_at: clan.clan_create_date,
            xp,
            level,
            xp_percentage: xpPercentage,
            // Null rather than zero when the source does not report it —
            // "we do not know the lifetime total" and "the guild has earned
            // none" are different claims, and only one of them is printable.
            lifetime_xp: clan.legacy_xp ?? null,
            guild_points: clan.guild_points ?? null,
            members: clan.clan.map((member) => ({
                id: member.brawlhalla_id,
                // A member v1 could not name is `""` by the mapper's contract.
                // The id still resolves, so the row is worth keeping and the
                // client falls back to `#id` for the label.
                name: member.name,
                slug: getEntitySlug(member.brawlhalla_id, member.name),
                rank: member.rank,
                joined_at: member.join_date,
                xp: member.xp,
                // Omitted, not zeroed, when the source has no such field: see
                // `GuildMember.guild_points`.
                ...(member.guild_points === undefined
                    ? {}
                    : { guild_points: member.guild_points }),
            })),
        },
        meta: { updated_at: updatedAt },
    }
}
