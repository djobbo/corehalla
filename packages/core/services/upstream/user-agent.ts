import { HttpClient, HttpClientRequest } from "effect/unstable/http"

/**
 * The `User-Agent` every outbound Brawlhalla request carries.
 *
 * Effect's fetch client sends no `User-Agent` of its own, so without this the
 * crawler is an anonymous client making a few thousand requests an hour — the
 * exact shape a provider blocks first. Brawlhalla's docs invite contact at
 * `api@brawlhalla.com`; a request that names the project and a URL to read is
 * what lets them ask a question instead of reaching for a block.
 *
 * The version is part of the contract: it gives them something to cite back if
 * a release misbehaves, and it is worth bumping for a change in crawl behavior
 * rather than only for a change in the product.
 */
export const USER_AGENT = "Corehalla/1.0 (+https://corehalla.com)"

/**
 * Applies the identifying `User-Agent` to every request the client sends.
 *
 * Used at both API-client construction points — v1 and the legacy v0 client —
 * so the two cannot drift into sending different identities. The header is set
 * rather than appended, so a caller that supplied its own cannot produce a
 * doubled value.
 */
export const withUserAgent = (client: HttpClient.HttpClient) =>
    HttpClient.mapRequest(
        HttpClientRequest.setHeader("User-Agent", USER_AGENT),
    )(client)
