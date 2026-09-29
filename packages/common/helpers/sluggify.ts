/**
 * Folds a display name into a URL-safe fragment.
 *
 * Taken from `kubi` (`packages/common/src/helpers/sluggify.ts`) so the two
 * projects spell an entity's URL the same way. The transform is deliberately
 * narrow: lowercase, spaces to hyphens, then every remaining non-ASCII letter is
 * dropped rather than transliterated. A name of nothing but symbols therefore
 * slugs to the empty string, which is why {@link getEntitySlug} keeps the id in
 * front of it — the id is the identity, the name is decoration.
 */
export const sluggify = (str: string): string =>
    encodeURIComponent(
        str
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^a-z0-9-]/g, ""),
    )
