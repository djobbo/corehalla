import { Stage } from "alchemy/Stage"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"

/**
 * The stage whose Cloudflare resources keep their original, unsuffixed names so
 * the first prod deploy adopts them instead of creating a second set.
 */
const PROD_STAGE = "prod"

const PROD_SITE_URL = "https://corehalla.com"

/** Every physical Cloudflare name in the `Corehalla` stack. */
export interface ResourceNames {
    readonly database: string
    readonly cmsDatabase: string
    readonly mediaBucket: string
    readonly cacheNamespace: string
    readonly crawlQueue: string
    readonly sampleQueue: string
    readonly apiWorker: string
    readonly crawlerWorker: string
    readonly webWorker: string
    readonly cmsWorker: string
    readonly storybookWorker: string
}

export interface Deployment {
    readonly stage: string
    readonly isProd: boolean
    readonly siteUrl: string
    readonly hostname: string
    readonly cmsHostname: string
    readonly uiHostname: string
    readonly names: ResourceNames
}

/**
 * Prod and dev share one Cloudflare account and one zone, so only prod may use
 * the bare names. Every other stage is `-dev`, which lets both stages exist
 * side by side without adopting or deleting each other's resources.
 */
const names = (isProd: boolean): ResourceNames => {
    const suffix = isProd ? "" : "-dev"
    const physical = (base: string) => `${base}${suffix}`

    return {
        database: physical("corehalla"),
        cmsDatabase: physical("corehalla-emdash"),
        mediaBucket: physical("corehalla-media"),
        cacheNamespace: physical("corehalla-api-cache"),
        crawlQueue: physical("corehalla-crawl"),
        sampleQueue: physical("corehalla-crawl-samples"),
        apiWorker: physical("corehalla-api"),
        crawlerWorker: physical("corehalla-crawler"),
        webWorker: physical("corehalla-web-next"),
        cmsWorker: physical("corehalla-cms"),
        storybookWorker: physical("corehalla-web-next-storybook"),
    }
}

/**
 * Prod has a known site, so omitting `SITE_URL` there is fine. Any other stage
 * must name its own host explicitly: a dev deploy that silently inherited
 * `corehalla.com` would take the production domain and its DNS record.
 */
const site = (isProd: boolean): Config.Config<URL> =>
    isProd
        ? Config.URL("SITE_URL").pipe(
              Config.withDefault(new URL(PROD_SITE_URL)),
          )
        : Config.URL("SITE_URL")

/**
 * The stage's addresses and physical names, resolved from the stage the CLI
 * selected plus `SITE_URL`. Hosts hang off the site host, so `dev` produces
 * `dev.corehalla.com`, `cms.dev.corehalla.com` and `ui.dev.corehalla.com`
 * without a second variable.
 */
export const deployment = Effect.fnUntraced(function* () {
    const stage = yield* Stage
    const isProd = stage === PROD_STAGE
    const url = yield* site(isProd)
    const hostname = url.hostname

    return {
        stage,
        isProd,
        siteUrl: url.origin,
        hostname,
        cmsHostname: `cms.${hostname}`,
        uiHostname: `ui.${hostname}`,
        names: names(isProd),
    }
})
