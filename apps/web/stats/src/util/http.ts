export async function http<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url)

        if (res.status !== 200) return null

        const json = (await res.json()) as T
        return json
    } catch (e) {
        return null
    }
}
