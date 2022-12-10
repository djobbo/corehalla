const __DEV = process.env.NODE_ENV === "development"

const isDevOrServer = __DEV || typeof window === "undefined"

export const logInfo: typeof console.log = (message, ...args) => {
    if (!isDevOrServer) return // eslint-disable-next-line no-console
    console.log(message, ...args)
}

export const logWarning: typeof console.warn = (message, ...args) => {
    if (!isDevOrServer) return // eslint-disable-next-line no-console
    __DEV && console.warn(message, ...args)
}

export const logError: typeof console.error = (message, ...args) => {
    if (!isDevOrServer) return // eslint-disable-next-line no-console
    __DEV && console.error(message, ...args)
}
