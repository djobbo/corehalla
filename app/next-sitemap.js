/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL ?? "https://dev.corehalla.com",
    generateRobotsTxt: true,
    priority: 1.0,
}
