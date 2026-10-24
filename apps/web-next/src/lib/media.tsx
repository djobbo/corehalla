import { useAtomValue } from "@effect/atom-react"
import { rankedBannerSrc } from "@/lib/assets"
import { mediaSlotsAtom } from "@/effect/atoms"
import { mediaSlotKey } from "./mediaSlot"

export { mediaSlotKey } from "./mediaSlot"

/**
 * Resolve a named CMS slot, falling back to the bundled asset while the slot
 * is empty. The fallback is what makes the migration incremental.
 */
export const useMediaSlot = (key: string, fallback: string): string => {
    const slots = useAtomValue(mediaSlotsAtom)

    return slots.get(key)?.image?.url ?? fallback
}

export const useMediaAlt = (key: string, fallback: string): string => {
    const slot = useAtomValue(mediaSlotsAtom).get(key)

    return slot?.alt || slot?.image?.alt || fallback
}

export const useLegendIcon = (nameKey: string, fallback: string): string =>
    useMediaSlot(mediaSlotKey("legend.icon", nameKey), fallback)

export const useRankedBanner = (tier: string | null | undefined): string => {
    const label = tier ?? "Valhallan"

    return useMediaSlot(
        mediaSlotKey("ranked.banner", label),
        rankedBannerSrc(label),
    )
}
