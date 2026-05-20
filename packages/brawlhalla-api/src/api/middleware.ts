import { HttpApiMiddleware } from "effect/unstable/httpapi"

export class ApiKeyMiddleware extends HttpApiMiddleware.Service<ApiKeyMiddleware>()(
    "BrawlhallaApi/ApiKey",
    {
        requiredForClient: true,
    },
) {}
