"use client"

import { ArrowSmRightIcon, DiscordIcon, KofiIcon } from "ui/icons"
import { Button } from "ui/base/Button"
import { Image } from "@/components/Image"
import { Trans } from "@lingui/macro"
import { clamp } from "common/helpers/math"
import { useEffect, useRef } from "react"

const DISCORD_MEMBERS = "3.8k+"

export const DiscordCard = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onMousePositionChange = (e: MouseEvent) => {
            if (!containerRef.current || !cardRef.current) return

            const {
                x: cardX,
                y: cardY,
                width,
                height,
            } = cardRef.current.getBoundingClientRect()

            const x = clamp(e.clientX - cardX, 0, width)
            const y = clamp(e.clientY - cardY, 0, height)
            const halfWidth = width / 2
            const halfHeight = height / 2

            const rotationX = (x - halfWidth) / 28
            const rotationY = (y - halfHeight) / 40

            const shadowX = (x - halfWidth) / 24
            const shadowY = (y - halfHeight) / 36

            const perspective = `${(cardRef.current?.offsetWidth ?? 0) * 6}px`

            containerRef.current.style.perspective = perspective
            cardRef.current.style.perspective = perspective
            cardRef.current.style.transform = `rotateY(${rotationX}deg) rotateX(${-rotationY}deg)`
            cardRef.current.style.filter = `drop-shadow(${-shadowX}px ${-shadowY}px 0.25rem #00000012)`
        }

        window.addEventListener("mousemove", onMousePositionChange)

        return () => {
            window.removeEventListener("mousemove", onMousePositionChange)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="scale-100 hover:scale-[1.01] transition-transform"
        >
            <div
                ref={cardRef}
                className="bg-bgVar2/50 border border-bg/75 rounded-2xl w-96 overflow-hidden"
            >
                <Image
                    src="/images/backgrounds/Wallpaper_Text.jpg"
                    alt="Discord header image"
                    className="object-cover object-center"
                    containerClassName="w-full h-32"
                />
                <div className="flex">
                    <Image
                        src="/images/Corehalla_Logo.gif"
                        alt="Corehalla animated logo"
                        className="object-cover object-center"
                        containerClassName="w-20 h-20 rounded-3xl -mt-10 ml-6 border-8 border-bgVar2 overflow-hidden"
                    />
                    <span className="text-sm ml-2 mt-2 text-textVar1 text-center">
                        {/* {t`${DISCORD_MEMBERS} discord members, and growing!`} */}
                        <Trans>
                            {DISCORD_MEMBERS} discord members, and growing!
                        </Trans>
                    </span>
                </div>
                <div className="h-64 flex flex-col justify-between">
                    <div className="p-6 flex flex-col gap-2 text-sm">
                        <p className="uppercase text-textVar1 font-semibold">
                            <Trans>Question of the day</Trans>
                        </p>
                        <p>
                            Which weapon(s) do you enjoy playing the most? and
                            which one(s) you dislike playing?
                        </p>
                        <a
                            href="/discord"
                            target="_blank"
                            aria-label="Join our Discord server to share your thoughts"
                        >
                            <span className="flex justify-end items-center gap-1 font-semibold bg-gradient-to-l from-accent to-accentVar1 bg-clip-text text-fill-none">
                                Share your thoughts
                                <ArrowSmRightIcon className="w-4 h-4" />
                            </span>
                        </a>
                    </div>
                    <div className="flex gap-2 justify-end p-4">
                        <Button as="a" href="/discord" target="_blank">
                            <DiscordIcon size="16" className="mr-2" /> Join
                        </Button>
                        <Button
                            as="a"
                            href="/donate"
                            target="_blank"
                            className="bg-accentAlt"
                        >
                            <KofiIcon size="16" className="mr-2" /> Donate
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
