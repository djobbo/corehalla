import { IncomingMessage } from 'http'

export const getHostURL = (req: IncomingMessage): string =>
    req.headers.host ? (process.env.NODE_ENV === 'production' ? 'https://' : 'http://') + req.headers.host : undefined
