import { Effect } from "effect"
import { HttpClient } from "effect/http"
import { BUILD_ID, CONTRACT_VERSION } from "@crh/api-contract/schemas"

let latestBuild: string | null = null
let compatible = true

/** False when the API response was built against a different wire contract. */
export const isContractCompatible = (): boolean => compatible

/** Latest build id seen on an API response — powers the reload prompt. */
export const latestServerBuild = (): string | null => latestBuild

/**
 * Stamps every API response. Missing headers (Storybook, a dev proxy) are
 * treated as compatible so they do not disable the normal path.
 */
export const withContract = (client: HttpClient.HttpClient) =>
    HttpClient.transform(client, (effect) =>
        effect.pipe(
            Effect.tap((response) =>
                Effect.sync(() => {
                    const raw = response.headers["x-corehalla-contract"]
                    const contract =
                        raw === undefined ? CONTRACT_VERSION : Number(raw)

                    latestBuild =
                        response.headers["x-corehalla-build"] ?? BUILD_ID
                    compatible =
                        Number.isFinite(contract) &&
                        contract === CONTRACT_VERSION
                }),
            ),
        ),
    )
