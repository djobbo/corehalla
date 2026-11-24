import { ArrowRightIcon, CoffeeIcon, MessageCircleIcon } from "lucide-react"
import type { ComponentType } from "react"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    communityActions,
    communityAnswer,
    communityPrompt,
    type CommunityActionId,
} from "@/lib/community"
import { cn } from "@/lib/cn"

const actionIcons: Record<
    CommunityActionId,
    ComponentType<{ className?: string }>
> = {
    join: MessageCircleIcon,
    support: CoffeeIcon,
}

/**
 * The landing's community funnel: the question the Discord is discussing, a way
 * into it, and the two asks the site runs on. Static by design — the question
 * and the art are shipped with the page, so it renders on the server and never
 * fetches.
 */
export const CommunityCard = () => (
    <section aria-labelledby="community" className="mt-12">
        <Card className="gap-0 py-0">
            <div className="relative">
                <img
                    src="/images/backgrounds/Wallpaper_Text.jpg"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-full object-cover object-center sm:h-32"
                />
                <img
                    src="/images/Corehalla_Logo.gif"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute -bottom-7 left-4 size-16 rounded-2xl border-4 border-card bg-bgVar2 object-cover sm:-bottom-9 sm:size-20 sm:border-8"
                />
            </div>
            <div className="flex flex-col gap-4 px-4 pt-10 pb-4 sm:px-5 sm:pt-12 md:flex-row md:items-end md:justify-between">
                <div className="flex min-w-0 flex-col gap-1.5">
                    <p className="ch-kicker">Question of the day</p>
                    <h2
                        id="community"
                        className="ch-display text-lg sm:text-xl"
                    >
                        Join the community
                    </h2>
                    <p className="max-w-xl text-sm leading-relaxed">
                        {communityPrompt}
                    </p>
                    <a
                        href={communityAnswer.href}
                        target="_blank"
                        rel="noreferrer"
                        className="w-fit text-xs font-bold tracking-[0.12em] text-ring uppercase transition-colors hover:text-foreground"
                    >
                        {communityAnswer.label}
                        <ArrowRightIcon
                            aria-hidden
                            className="ml-1 inline size-3.5 align-[-0.125em]"
                        />
                    </a>
                </div>
                <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0 md:justify-end">
                    {communityActions.map((action) => {
                        const Icon = actionIcons[action.id]

                        return (
                            <a
                                key={action.id}
                                href={action.href}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                    buttonVariants({
                                        variant:
                                            action.id === "support"
                                                ? "secondary"
                                                : "default",
                                    }),
                                    "w-full md:w-auto",
                                )}
                            >
                                <Icon aria-hidden />
                                {action.label}
                            </a>
                        )
                    })}
                </div>
            </div>
        </Card>
    </section>
)
