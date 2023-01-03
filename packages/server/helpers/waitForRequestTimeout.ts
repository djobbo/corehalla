import { logError, logInfo } from "logger"

const DEFAULT_REQUEST_TIMEOUT = 1000 * 8 // 8 seconds

export const waitForRequestTimeout = async <TReturn>(
    request: Promise<TReturn>,
    {
        abortController = new AbortController(),
        timeout = DEFAULT_REQUEST_TIMEOUT, // 10 seconds
    }: { abortController?: AbortController; timeout?: number } = {},
) => {
    const fireAndForgetPromise = request.catch((error) => {
        if (error.name === "AbortError") {
            logError("Request aborted", error)
            return
        }

        logError("Request failed", error)
    })

    let timeoutId: NodeJS.Timeout

    const timeoutPromise = new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
            logInfo(`Request timed out after ${timeout}ms`)
            clearTimeout(timeoutId)
            abortController.abort()
            resolve()
        }, timeout)
    })

    return Promise.race([fireAndForgetPromise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutId)
    })
}
