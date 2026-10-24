import { HttpClient, HttpClientRequest } from "effect/http"

/** Effect's fetch client sends none; anonymous crawl traffic gets blocked. */
export const USER_AGENT = "Corehalla/1.0 (+https://corehalla.com)"

/** setHeader (not append) so a caller cannot double the value. */
export const withUserAgent = (client: HttpClient.HttpClient) =>
    HttpClient.mapRequest(
        HttpClientRequest.setHeader("User-Agent", USER_AGENT),
    )(client)
