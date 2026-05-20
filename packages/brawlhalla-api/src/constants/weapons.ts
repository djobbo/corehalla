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

export type Weapon = (typeof weapons)[number]
