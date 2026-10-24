/** `ranked.banner.Gold 3` → `ranked.banner.gold-3`. */
export const mediaSlotKey = (prefix: string, value: string): string =>
    `${prefix}.${value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`
