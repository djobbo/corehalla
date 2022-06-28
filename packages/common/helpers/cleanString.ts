export const cleanString = (str: string): string => {
    try {
        return decodeURIComponent(escape(str))
    } catch (e) {
        return str
    }
}
