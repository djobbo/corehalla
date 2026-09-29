import { sluggify } from "./sluggify"

/**
 * An entity's canonical URL segment: `1234-some-name`.
 *
 * The id leads, exactly as in `kubi`, and that is the load-bearing part. The
 * slug is what makes a profile URL readable and shareable, but it is not what
 * identifies the entity — a player renames, and a name-only URL would 404 (or
 * worse, resolve to somebody else) the moment they do. Keeping the id first
 * means a route can always recover the real key with {@link parseEntityId},
 * and a stale name half is a redirect rather than a miss.
 *
 * The name half is capped at 24 characters so a pathological name cannot push
 * the meaningful part of a URL off the end of a share card or a log line.
 */
export const getEntitySlug = (id: number | string, name: string): string =>
    `${id}-${sluggify(name).slice(0, 24)}`

/**
 * The entity id at the head of a slug, or `null` when there is none.
 *
 * Accepts a bare id too, so a link minted before slugs existed — or one built
 * from a favourite, which only ever stored the id — still resolves. Leading
 * digits are read and the rest is ignored; the name half is not validated here
 * because deciding whether a slug is *canonical* is the route's job, not this
 * parser's.
 */
export const parseEntityId = (slug: string): number | null => {
    const match = /^\s*(\d+)/.exec(slug)

    return match ? Number(match[1]) : null
}
