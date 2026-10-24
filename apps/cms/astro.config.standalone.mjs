import cloudflare from "@astrojs/cloudflare"
import base from "./astro.config.base.mjs"

/** `astro dev` / `astro build` outside Alchemy. */
export default { ...base, adapter: cloudflare() }
