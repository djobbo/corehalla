import { Effect } from "effect"
import { buildGuild } from "../aggregate/guild"
import {
    PLAN,
    partFromResult,
    sectionMeta,
    toSectionError,
} from "../sections/meta"
import type { PartEntries } from "../sections/meta"
import type { V1UpstreamShape } from "../upstream/client"
import type { GuildEnvelope, SectionError } from "@crh/api-contract/schemas"

export const directGuild = (
    upstream: V1UpstreamShape,
    guildId: number,
): Effect.Effect<GuildEnvelope, SectionError> =>
    Effect.gen(function* () {
        const at = Date.now()
        const clan = yield* upstream.getClan(guildId).pipe(Effect.result)

        const parts: PartEntries = {
            clan: partFromResult(clan, at),
        }

        if (clan._tag === "Failure") {
            return yield* Effect.fail(toSectionError(PLAN.guildProfile, parts))
        }

        if (clan.success === null) {
            return yield* Effect.fail(toSectionError(PLAN.guildProfile, parts))
        }

        const envelope = buildGuild(clan.success, at)

        return {
            data: envelope.data,
            meta: sectionMeta(PLAN.guildProfile, parts, at),
        }
    })
