import { unix } from "dayjs"

/**
 * @error returns different dates in client or ssr mode
 * @issue https://github.com/iamkun/dayjs/issues/1690
 */
export const getDateFromUnixTime = (unixTime: number, template?: string) =>
    unix(unixTime).format(template)

type HMSTime = {
    hours: number
    minutes: number
    seconds: number
}

export const getHMSFromSeconds = (seconds: number): HMSTime => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    return {
        hours,
        minutes: minutes % 60,
        seconds: seconds % 60,
    }
}

export const getHMSStringFromSeconds = (
    milliseconds: number,
    template: ({ hours, minutes, seconds }: HMSTime) => string,
) => {
    const timeData = getHMSFromSeconds(milliseconds)
    return template(timeData)
}

export const formatTime = (seconds: number) =>
    getHMSStringFromSeconds(
        seconds,
        ({ hours, minutes, seconds }) => `${hours}h ${minutes}m ${seconds}s`,
    )

export const formatUnixTime = (unixTime: number) =>
    getDateFromUnixTime(unixTime, "MMM DD, YYYY")

/**
 * How long ago something happened, in whole units, with `now` injectable.
 *
 * Written by hand rather than via a `fromNow()` plugin for two reasons. The
 * first is that a component rendering this has to agree between the server
 * render and hydration, and a function that reads the clock itself cannot be
 * given the same instant on both sides. The second is that the wording is a
 * product decision — this is rendered next to cached data, where "5 minutes
 * ago" is the fact being communicated — so it should not be a library's
 * locale-dependent default.
 *
 * `from` is epoch milliseconds, matching `meta.updated_at`. Anything under ten
 * seconds reads as "just now" rather than "0 seconds ago", and a future
 * timestamp (a clock skew between the worker and the browser) clamps to "just
 * now" instead of counting backwards.
 */
export const formatRelativeTime = (
    from: number,
    now: number = Date.now(),
): string => {
    const seconds = Math.max(0, Math.round((now - from) / 1000))

    if (seconds < 10) return "just now"
    if (seconds < 60) return `${seconds} seconds ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`

    const days = Math.floor(hours / 24)
    return `${days} ${days === 1 ? "day" : "days"} ago`
}
