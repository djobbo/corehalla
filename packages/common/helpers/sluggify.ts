/**
 * Lowercase, spaces to hyphens, drop remaining non-ASCII — no transliteration.
 * A symbols-only name slugs to `""`, which is why {@link getEntitySlug} keeps
 * the id in front.
 */
export const sluggify = (str: string): string =>
    encodeURIComponent(
        str
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^a-z0-9-]/g, ""),
    )
