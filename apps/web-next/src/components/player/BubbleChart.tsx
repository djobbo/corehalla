import { useMemo, useState } from "react"
import { bubbleWinrate } from "@/lib/bubbles"
import { VIEW, packBubbles } from "@/lib/packBubbles"
import type { BubbleNode } from "@/lib/bubbles"

/** In viewBox units; below this a thumbnail is unreadable. */
const IMAGE_RADIUS = 11
const RIM_RADIUS = 16

/** Falls back to an initial: some roster art is not downloaded. */
const BubbleArt = ({
    bubble,
    x,
    y,
    radius,
    clip,
}: {
    readonly bubble: BubbleNode
    readonly x: number
    readonly y: number
    readonly radius: number
    readonly clip: string
}) => {
    const [failed, setFailed] = useState(false)

    if (failed || radius < IMAGE_RADIUS) {
        return (
            <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-ink)"
                fontSize={radius}
                fontWeight={800}
            >
                {bubble.name.slice(0, 1)}
            </text>
        )
    }

    return (
        // The roster art is square (250–267px), so an SVG image with `slice`
        // crops it to the circle on its own.
        <image
            href={bubble.icon}
            x={x - radius}
            y={y - radius}
            width={radius * 2}
            height={radius * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clip})`}
            onError={() => setFailed(true)}
        />
    )
}

export const BubbleChart = ({
    bubbles,
    subject,
    caption,
    metricHeading,
    formatValue,
    scaleExponent,
    unit,
    idPrefix,
}: {
    readonly bubbles: readonly BubbleNode[]
    readonly subject: string
    readonly caption: string
    readonly metricHeading: string
    readonly formatValue: (bubble: BubbleNode) => string
    readonly scaleExponent: number
    readonly unit?: string
    readonly idPrefix: string
}) => {
    const [hovered, setHovered] = useState<string | null>(null)

    const packed = useMemo(
        () => packBubbles(bubbles, "matchtime", scaleExponent),
        [bubbles, scaleExponent],
    )

    const rows = useMemo(
        () =>
            [...packed].sort(
                (a, b) =>
                    b.data.matchtime - a.data.matchtime ||
                    (a.data.key < b.data.key
                        ? -1
                        : a.data.key > b.data.key
                          ? 1
                          : 0),
            ),
        [packed],
    )

    if (packed.length === 0) return null

    const focused = rows.find((row) => row.data.key === hovered)
    const focusedWinrate = focused ? bubbleWinrate(focused.data) : null

    return (
        <div className="flex flex-col gap-3">
            <div className="relative">
                <svg
                    viewBox={`0 0 ${VIEW} ${VIEW}`}
                    className="mx-auto block h-auto w-full max-w-76"
                    aria-hidden
                >
                    <defs>
                        {packed.map((bubble, index) => (
                            // A clipPath's children are relative to the clipped
                            // element, not to the defs, so the circle needs x/y.
                            <clipPath
                                key={`${idPrefix}-bubble-${index}`}
                                id={`${idPrefix}-bubble-${index}`}
                            >
                                <circle
                                    cx={bubble.x}
                                    cy={bubble.y}
                                    r={bubble.radius}
                                />
                            </clipPath>
                        ))}
                    </defs>

                    {packed.map((bubble, index) => {
                        const clip = `${idPrefix}-bubble-${index}`

                        const art = (
                            <>
                                <circle
                                    cx={bubble.x}
                                    cy={bubble.y}
                                    r={bubble.radius}
                                    fill="var(--primary)"
                                />
                                <BubbleArt
                                    bubble={bubble.data}
                                    x={bubble.x}
                                    y={bubble.y}
                                    radius={bubble.radius}
                                    clip={clip}
                                />
                                {bubble.radius >= RIM_RADIUS && (
                                    <circle
                                        cx={bubble.x}
                                        cy={bubble.y}
                                        r={bubble.radius}
                                        fill="none"
                                        stroke="var(--color-ink)"
                                        strokeOpacity={0.55}
                                        strokeWidth={1.5}
                                    />
                                )}
                            </>
                        )

                        // Pointer-only: the table below is the accessible
                        // representation, so the chart never enters the tab order.
                        return (
                            <g
                                key={bubble.data.key}
                                onMouseEnter={() => setHovered(bubble.data.key)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {bubble.data.href ? (
                                    <a
                                        href={bubble.data.href}
                                        tabIndex={-1}
                                        className="cursor-pointer"
                                    >
                                        {art}
                                    </a>
                                ) : (
                                    art
                                )}
                            </g>
                        )
                    })}
                </svg>

                {focused && (
                    <div
                        className="pointer-events-none absolute z-20 w-max max-w-60 -translate-x-1/2 translate-y-[-130%] bg-foreground px-2.5 py-2 text-xs text-background"
                        style={{
                            left: `${(focused.x / VIEW) * 100}%`,
                            top: `${(focused.y / VIEW) * 100}%`,
                        }}
                    >
                        <span className="flex items-center gap-2">
                            <span
                                aria-hidden
                                className="ch-dot"
                                style={{
                                    background: "var(--primary)",
                                }}
                            />
                            <span className="font-bold">
                                {focused.data.name}
                            </span>
                            {focused.data.level === undefined ? null : (
                                <span className="text-background/60">
                                    Level {focused.data.level}
                                </span>
                            )}
                        </span>
                        <span className="mt-1 block tabular-nums">
                            {formatValue(focused.data)}
                            {unit ? (
                                <span className="text-background/60">
                                    {" "}
                                    {unit}
                                </span>
                            ) : null}
                        </span>
                        {focused.data.games === undefined ||
                        focusedWinrate === null ? null : (
                            <span className="block text-background/60 tabular-nums">
                                {focused.data.games.toLocaleString()} games ·{" "}
                                {focusedWinrate.toFixed(1)}% winrate
                            </span>
                        )}
                    </div>
                )}
            </div>

            <table className="sr-only">
                <caption>{caption}</caption>
                <thead>
                    <tr>
                        <th scope="col">{subject}</th>
                        <th scope="col" aria-sort="descending">
                            {metricHeading}
                        </th>
                        <th scope="col">Games</th>
                        <th scope="col">Winrate</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const winrate = bubbleWinrate(row.data)

                        return (
                            <tr key={row.data.key}>
                                <th scope="row">
                                    {row.data.href ? (
                                        <a href={row.data.href}>
                                            {row.data.name}
                                        </a>
                                    ) : (
                                        row.data.name
                                    )}
                                </th>
                                <td>{formatValue(row.data)}</td>
                                <td>
                                    {row.data.games?.toLocaleString() ?? "—"}
                                </td>
                                <td>
                                    {winrate === null
                                        ? "—"
                                        : `${winrate.toFixed(1)}%`}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
