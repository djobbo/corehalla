import { logInfo } from "@ch/logger"

export const withTimeLog = <TArgs extends unknown[], TReturnType>(
    request: (...args: TArgs) => Promise<TReturnType>,
    name: string,
) => {
    return async (...args: TArgs) => {
        const start = Date.now()
        const result = await request(...args)
        const end = Date.now()
        logInfo(`[TIME_LOG] ${name} | ${end - start}ms`)
        return result
    }
}
