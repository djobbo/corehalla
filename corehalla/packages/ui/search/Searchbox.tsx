import { IS_DEV } from "common/helpers/nodeEnv"
import {
    KBarAnimator,
    KBarPortal,
    KBarPositioner,
    KBarResults,
    KBarSearch,
    useMatches,
} from "kbar"
import { bg, border, css, text } from "../theme"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { legendsMap } from "bhapi/legends"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useRankings1v1 } from "bhapi/hooks/useRankings"
import { useRouter } from "next/router"
import Image from "next/image"
import type { ActionImpl } from "kbar"

// const cnasodnsa = css({
//     padding: 12px 16px;
//     font-size: 16px;
//     width: 100%;
//      box-sizing: border-box;
//       outline: none;
//        border: none;
//         background: var(--background);
//          color: var(--foreground);
// })

export const Searchbox = () => {
    const [search, setSearch, immediateSearch] = useDebouncedState(
        "",
        IS_DEV ? 200 : 1500,
    )
    const { results } = useMatches()

    const router = useRouter()

    const { rankings1v1 } = useRankings1v1("all", "1", search) // TODO: enable only if search isn't empty

    // @ts-expect-error actions not yet implemented properly
    const actions: ActionImpl[] = rankings1v1
        ? rankings1v1
              .filter((player) =>
                  player.name
                      .toLowerCase()
                      .startsWith(immediateSearch.toLowerCase()),
              )
              .map((player) => {
                  const legend = legendsMap[player.best_legend]
                  return {
                      id: player.brawlhalla_id.toString(),
                      name: cleanString(player.name),
                      shortcut: [],
                      keywords: "",
                      section: undefined,
                      icon: legend && (
                          <div
                              className="w-8 h-8 relative"
                              key={legend.legend_id}
                          >
                              <Image
                                  src={`/images/icons/legends/${legend.bio_name}.png`}
                                  alt={legend.bio_name}
                                  layout="fill"
                                  objectFit="contain"
                                  objectPosition="center"
                              />
                          </div>
                      ),
                      subtitle: `${player.rating} / ${player.peak_rating} peak (${player.tier})`,
                      command: {
                          perform: () =>
                              router.push(
                                  `/stats/player/${player.brawlhalla_id}`,
                              ),
                      },
                  }
              })
        : []

    const items = [...actions, ...results]

    return (
        <KBarPortal>
            {/* @ts-expect-error kbar is weird */}
            <KBarPositioner
                className="z-20"
                style={{
                    backgroundColor: "#0004",
                }}
            >
                {/* @ts-expect-error kbar is weird */}
                <KBarAnimator className="w-full max-w-screen-md">
                    <div
                        className={cn(
                            "rounded-lg overflow-hidden border mx-auto",
                            bg("blue2"),
                            border("blue3"),
                        )}
                    >
                        <KBarSearch
                            className={cn("px-4 py-3 w-full", text("blue3"))}
                            placeholder="Search player..."
                            onChange={(e) => {
                                setSearch(e.target.value)
                            }}
                            value={search}
                        />
                        <KBarResults
                            items={items}
                            onRender={({ item, active }) =>
                                typeof item === "string" ? (
                                    <div className="px-4 py-3 w-full">
                                        {item}
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            "px-4 py-3 w-full flex items-center border-b cursor-pointer",
                                            border("blue4"),
                                            {
                                                [bg("blue3")]: active,
                                            },
                                        )}
                                    >
                                        {item.icon}
                                        <div className="ml-4">
                                            <p>{item.name}</p>
                                            <p
                                                className={cn(
                                                    "uppercase text-xs",
                                                    text("blue11"),
                                                )}
                                            >
                                                {item.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                )
                            }
                        />
                    </div>
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
    )
}
