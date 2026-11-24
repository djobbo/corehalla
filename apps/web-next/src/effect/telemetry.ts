export type FallbackReport = {
    readonly section: string
    readonly ok: boolean
    readonly duration_ms: number
    readonly reason?: string
}

/**
 * Best-effort same-origin telemetry. The endpoint lives on the web worker, not
 * the API binding, so it still answers while the API is the thing that failed.
 */
export const reportFallback = (report: FallbackReport): void => {
    if (import.meta.env.SSR) return

    // eslint-disable-next-line no-console
    console.debug("[corehalla] upstream fallback", report)

    void fetch("/api/telemetry", {
        method: "POST",
        // The report is anonymous and the endpoint reads nothing from the
        // session; without this the browser attaches `corehalla_session`.
        credentials: "omit",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "upstream_fallback", ...report }),
        keepalive: true,
    }).catch(() => undefined)
}
