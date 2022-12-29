const TIMEOUT_EXIT_CODE = 124

export const timeoutAfter = async <TArgs extends unknown[]>(
    request: (args: TArgs) => Promise<unknown>,
    time = -1,
) => {
    const timeout = new Promise((_, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id)
            reject(new Error("Request timed out"))
        }, time)
    })

    return Promise.race([request, timeout]).catch((error) => {
        if (error.message === "Request timed out") {
            process.exit(TIMEOUT_EXIT_CODE)
        }
        throw error
        process.exit(TIMEOUT_EXIT_CODE)
    })
}
