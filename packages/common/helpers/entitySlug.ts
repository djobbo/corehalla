import { sluggify } from "./sluggify"

/**
 * Id leads so a rename cannot 404 or resolve to someone else. Name half capped
 * at 24 so a pathological name cannot push the id off a share card.
 */
export const getEntitySlug = (id: number | string, name: string): string =>
    `${id}-${sluggify(name).slice(0, 24)}`

/**
 * Leading digits only; accepts a bare id. Name half is not validated here —
 * canonicity is the route's job.
 */
export const parseEntityId = (slug: string): number | null => {
    const match = /^\s*(\d+)/.exec(slug)

    return match ? Number(match[1]) : null
}
