export const useCopyToClipboard = () => {
    const copyToClipboard = async (text: string) => {
        if (!navigator?.clipboard) return false

        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch (error) {
            return false
        }
    }

    return copyToClipboard
}
