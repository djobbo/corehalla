import { describe, expect, it } from "@effect/vitest"
import { Stage } from "alchemy/Stage"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Effect from "effect/Effect"
import { deployment } from "./deployment"

const at = (stage: string, env: Record<string, string>) =>
    deployment().pipe(
        Effect.provideService(Stage, stage),
        Effect.provideService(
            ConfigProvider.ConfigProvider,
            ConfigProvider.fromUnknown(env),
        ),
    )

const prodNames = {
    database: "corehalla",
    cmsDatabase: "corehalla-emdash",
    mediaBucket: "corehalla-media",
    cacheNamespace: "corehalla-api-cache",
    crawlQueue: "corehalla-crawl",
    sampleQueue: "corehalla-crawl-samples",
    apiWorker: "corehalla-api",
    crawlerWorker: "corehalla-crawler",
    webWorker: "corehalla-web-next",
    cmsWorker: "corehalla-cms",
    storybookWorker: "corehalla-web-next-storybook",
} as const

const suffixed = (suffix: string) =>
    Object.fromEntries(
        Object.entries(prodNames).map(([key, name]) => [
            key,
            `${name}${suffix}`,
        ]),
    )

describe("deployment", () => {
    it.effect("prod keeps today's physical names and the apex site", () =>
        Effect.gen(function* () {
            const target = yield* at("prod", {})

            expect(target).toMatchObject({
                stage: "prod",
                isProd: true,
                siteUrl: "https://corehalla.com",
                hostname: "corehalla.com",
                cmsHostname: "cms.corehalla.com",
                uiHostname: "ui.corehalla.com",
                names: prodNames,
            })
        }),
    )

    it.effect("every physical name is -dev suffixed outside prod", () =>
        Effect.gen(function* () {
            const target = yield* at("dev", {
                SITE_URL: "https://dev.corehalla.com",
            })

            expect(target).toMatchObject({
                stage: "dev",
                isProd: false,
                siteUrl: "https://dev.corehalla.com",
                hostname: "dev.corehalla.com",
                cmsHostname: "cms.dev.corehalla.com",
                uiHostname: "ui.dev.corehalla.com",
                names: suffixed("-dev"),
            })
        }),
    )

    it.effect("prod honours an explicit SITE_URL", () =>
        Effect.gen(function* () {
            const target = yield* at("prod", {
                SITE_URL: "https://example.com/",
            })

            expect(target.siteUrl).toBe("https://example.com")
            expect(target.hostname).toBe("example.com")
            expect(target.cmsHostname).toBe("cms.example.com")
            expect(target.names).toEqual(prodNames)
        }),
    )

    it.effect("dev fails fast without SITE_URL", () =>
        Effect.gen(function* () {
            const error = yield* Effect.flip(at("dev", {}))

            expect(error._tag).toBe("ConfigError")
        }),
    )

    it.effect("dev rejects a site without a scheme", () =>
        Effect.gen(function* () {
            const error = yield* Effect.flip(
                at("dev", { SITE_URL: "dev.corehalla.com" }),
            )

            expect(error._tag).toBe("ConfigError")
        }),
    )
})
