import { IS_DEV } from "common/helpers/nodeEnv"

export const logInfo: typeof console.log = (message, ...args) => {
    // eslint-disable-next-line no-console
    IS_DEV && console.log(message, ...args)
}

export const logWarning: typeof console.warn = (message, ...args) => {
    // eslint-disable-next-line no-console
    IS_DEV && console.warn(message, ...args)
}

export const logError: typeof console.error = (message, ...args) => {
    // eslint-disable-next-line no-console
    IS_DEV && console.error(message, ...args)
}
