import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"

type AliasesSubtitleProps = {
    immediateSearch: string
    aliases?: readonly string[]
}

/**
 * Renders a player's other aliases, bolding the one that starts with what the
 * user has typed so far.
 *
 * Shared by the command-bar searchbox and the landing composer so both show
 * identical result subtitles.
 */
export const AliasesSubtitle = ({
    immediateSearch,
    aliases,
}: AliasesSubtitleProps) => {
    if (!aliases || aliases.length === 0) {
        return null
    }

    return (
        <span className="flex gap-1">
            {aliases.map((alias) => {
                const cleanAlias = cleanString(alias)

                if (cleanAlias.length < 2 || cleanAlias.endsWith("•2")) return

                return (
                    <span
                        key={cleanAlias}
                        className={cn({
                            "font-semibold": cleanAlias
                                .toLowerCase()
                                .startsWith(immediateSearch.toLowerCase()),
                        })}
                    >
                        {cleanAlias}
                    </span>
                )
            })}
        </span>
    )
}
