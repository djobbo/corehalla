import { describe, expect, it } from "@effect/vitest"
import { alerts, currentAlert } from "./alerts"
import type { Alert } from "./alerts"
import { discordUrl } from "./communityLinks"

const ABSOLUTE_HTTPS = /^https:\/\/[^/\s]+/
const PLACEHOLDER = /\{\{|TODO|FIXME|TBD|lorem ipsum/i

const linksOf = (alert: Alert) => (alert.link === undefined ? [] : [alert.link])

describe("alerts", () => {
    it("gives every key a short, finished line of copy", () => {
        for (const [key, alert] of Object.entries(alerts)) {
            expect(alert.text.trim(), key).not.toBe("")
            expect(alert.text.length, key).toBeLessThan(200)
            expect(alert.text, key).not.toMatch(PLACEHOLDER)
        }
    })

    it("points every link at an absolute https destination with a label", () => {
        for (const alert of Object.values(alerts)) {
            for (const link of linksOf(alert)) {
                expect(link.href).toMatch(ABSOLUTE_HTTPS)
                expect(link.label.trim()).not.toBe("")
            }
        }
    })

    it("sends Discord links to the shared community invite", () => {
        const discordLinks = Object.values(alerts)
            .flatMap(linksOf)
            .filter((link) => link.href.includes("discord"))

        expect(discordLinks.length).toBeGreaterThan(0)

        for (const link of discordLinks) {
            expect(link.href).toBe(discordUrl)
        }
    })
})

describe("currentAlert", () => {
    it("resolves a configured key to its entry", () => {
        expect(currentAlert("BH_MAINTENANCE")).toBe(alerts.BH_MAINTENANCE)
    })

    it("renders nothing when the key is unset", () => {
        expect(currentAlert(undefined)).toBeNull()
        expect(currentAlert("")).toBeNull()
    })

    it("renders nothing when the key is unknown", () => {
        expect(currentAlert("NOT_A_KEY")).toBeNull()
    })
})
