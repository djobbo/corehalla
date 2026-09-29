import dayjs from "dayjs"

/**
 * Date helpers.
 *
 * Vendored from `packages/common/helpers/date.ts`: that module uses the named
 * `import { unix } from "dayjs"`, which Vite's SSR module runner cannot resolve
 * for this CommonJS package. The default import works in both the browser and
 * the Node SSR runtime.
 */

export const getDateFromUnixTime = (unixTime: number, template?: string) =>
    dayjs.unix(unixTime).format(template)

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
