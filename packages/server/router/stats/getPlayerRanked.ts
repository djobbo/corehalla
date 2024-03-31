import { getPlayerRanked as getPlayerRankedFn } from "bhapi"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { logError, logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { updateDBPlayerAliases } from "../../mutations/updateDBPlayerAliases"
import { waitForRequestTimeout } from "../../helpers/waitForRequestTimeout"
import { withTimeLog } from "../../helpers/withTimeLog"
import { z } from "zod"
import type { BHPlayerAlias } from "db/generated/client"

export const getPlayerRanked = publicProcedure //
    .input(
        z.object({
            playerId: numericLiteralValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { playerId } = req.input
            logInfo("getPlayerRanked", req.input)

            const controller = new AbortController()

            const ranked = await withTimeLog(
                getPlayerRankedFn,
                "BHAPI:playerRanked",
            )(playerId)

            // TODO: check whole object with zod
            try {
                z.number().parse(ranked?.brawlhalla_id)
            } catch {
                throw new Error("Player ranked not found")
            }

            const aliases = [
                {
                    id: ranked.brawlhalla_id,
                    name: ranked.name,
                },
                ...(ranked["2v2"]?.map(getTeamPlayers).flat() ?? []),
            ].map<BHPlayerAlias>(({ name, id }) => ({
                playerId: id.toString(),
                alias: name,
                createdAt: new Date(),
                public: true,
            }))

            // Fire and forget
            const fireAndForget = withTimeLog(
                updateDBPlayerAliases,
                "updateDBPlayerAliases",
            )(aliases, {
                abortSignal: controller.signal,
            }).catch((e) => {
                logError("Error updating player aliases", e)
            })

            waitForRequestTimeout(fireAndForget, {
                abortController: controller,
            })

            return ranked
        }, "getPlayerRanked"),
    )
