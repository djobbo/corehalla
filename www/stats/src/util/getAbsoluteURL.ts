export const getAbsoluteURL = (path: string): string => {
    const baseURL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_PROD_URL
        : 'http://localhost:3000'
    return baseURL + path
}
