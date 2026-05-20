const __DEV = process.env.NODE_ENV === "development"

const isDevOrServer = __DEV || typeof window === "undefined"

export const logInfo: typeof console.log = (message, ...args) => {
    if (!isDevOrServer) return
    console.log(message, ...args)
}

export const logWarning: typeof console.warn = (message, ...args) => {
    if (!isDevOrServer || !__DEV) return
    console.warn(message, ...args)
}

export const logError: typeof console.error = (message, ...args) => {
    if (!isDevOrServer || !__DEV) return
    console.error(message, ...args)
}
