export const legendIconSrc = (legendNameKey: string): string =>
    `/images/icons/roster/legends/${legendNameKey}.png`

export const weaponIconSrc = (weapon: string): string =>
    `/images/icons/weapons/${encodeURIComponent(weapon)}.png`

export const regionFlagSrc = (region: string): string =>
    `/images/icons/flags/${region.toUpperCase()}.png`

export const rankedBannerSrc = (tier: string | null | undefined): string =>
    `/images/ranked-banners/${tier ?? "Valhallan"}.png`
