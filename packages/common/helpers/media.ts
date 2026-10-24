/**
 * EmDash serves uploaded media from its own Worker. The web app re-publishes
 * those files under `staticMediaPrefix` (`apps/web-next/src/server.ts`), so
 * everything user-facing points at the site origin instead of `cms.*`.
 */
export const cmsMediaPrefix = "/_emdash/api/media/file/"

export const staticMediaPrefix = "/static/"

export const toStaticMediaUrl = (url: string): string =>
    url.startsWith(cmsMediaPrefix)
        ? `${staticMediaPrefix}${url.slice(cmsMediaPrefix.length)}`
        : url
