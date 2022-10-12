type AppEvent = "favorite:added" | "favorite:removed"

const appEventCallbacks = new Map<AppEvent, (() => void)[]>([
    ["favorite:added", []],
    ["favorite:removed", []],
])

export const triggerAppEventCallback = (event: AppEvent) => {
    const callbacks = appEventCallbacks.get(event)
    if (callbacks) {
        callbacks.forEach((callback) => callback())
    }
}
