const __DEV = process.env.NODE_ENV === "development"

export const logInfo: typeof console.log = (message, ...args) => {
    // eslint-disable-next-line no-console
    __DEV && console.log(message, ...args)
}

export const logWarning: typeof console.warn = (message, ...args) => {
    // eslint-disable-next-line no-console
    __DEV && console.warn(message, ...args)
}

export const logError: typeof console.error = (message, ...args) => {
    // eslint-disable-next-line no-console
    __DEV && console.error(message, ...args)
}
