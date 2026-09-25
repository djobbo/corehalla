/**
 * Client-safe game constants.
 *
 * These previously came from `bhapi/constants`, which also exports zod
 * validators. Importing the module for these plain arrays pulled a second zod
 * copy into the browser bundle, so the arrays the Start app needs are declared
 * here with the same values and order.
 */

export const rankedRegions = [
    "all",
    "us-e",
    "eu",
    "sea",
    "brz",
    "aus",
    "us-w",
    "jpn",
    "sa",
    "me",
] as const

export const weapons = [
    "Grapple Hammer",
    "Sword",
    "Blasters",
    "Rocket Lance",
    "Spear",
    "Katars",
    "Axe",
    "Bow",
    "Gauntlets",
    "Scythe",
    "Cannon",
    "Orb",
    "Greatsword",
    "Battle Boots",
    "Chakram",
] as const
