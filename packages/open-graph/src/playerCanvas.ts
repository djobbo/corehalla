import { Canvas, createCanvas, loadImage, NodeCanvasRenderingContext2D } from 'canvas'

import { OG_CANVAS_HEIGHT, OG_CANVAS_WIDTH } from './defaults'

const WEBSITE_URL = 'https://neue.corehalla.com/images/'

console.log(__dirname)
// registerFont('./fonts/Poppins-Regular.ttf', { family: 'Poppins', weight: '400' })
// registerFont('./fonts/Poppins-Bold.ttf', { family: 'Poppins', weight: '700' })

const createTextGroup = (ctx: NodeCanvasRenderingContext2D, title: string, content: string, x: number, y: number) => {
    ctx.fillStyle = 'white'
    ctx.font = 'bold 35px Poppins'
    ctx.fillText(title, x, y)

    if (!content) return
    ctx.font = 'normal 20px Poppins'
    ctx.fillText(content.toUpperCase(), x, y + 26)
}

interface PlayerCanvasProps {
    name: string
    level: string
    xp: string
    matchtime: string
    region: string
    mostPlayed: {
        legend?: string
        weapon?: string
    }
}

export const createPlayerCanvas = async ({
    name,
    level,
    xp,
    matchtime,
    region = 'US-E',
    mostPlayed,
}: PlayerCanvasProps): Promise<Canvas> => {
    try {
        const canvas = createCanvas(OG_CANVAS_WIDTH, OG_CANVAS_HEIGHT)

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#202225' //TODO: theme
        ctx.fillRect(0, 0, OG_CANVAS_WIDTH, OG_CANVAS_HEIGHT)

        if (mostPlayed.legend) {
            try {
                const legend = await loadImage(`${WEBSITE_URL}/legends/${mostPlayed.legend}.png`)
                ctx.drawImage(legend, -0.5 * legend.width, 0.5 * (OG_CANVAS_HEIGHT - legend.height))
            } catch {}
        }

        const fadeToBlackGradient = ctx.createLinearGradient(0, 0, 0, OG_CANVAS_HEIGHT)
        fadeToBlackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
        fadeToBlackGradient.addColorStop(1, 'black')

        ctx.fillStyle = fadeToBlackGradient
        ctx.fillRect(0, 0, OG_CANVAS_WIDTH, OG_CANVAS_HEIGHT)

        ctx.fillStyle = '#202225CC' //TODO: theme
        ctx.fillRect(0, 0, OG_CANVAS_WIDTH, OG_CANVAS_HEIGHT)

        const flag = await loadImage(`${WEBSITE_URL}/icons/flags/${region}.png`)
        ctx.drawImage(flag, 40, 40, 48, 48)

        ctx.fillStyle = 'white'
        ctx.font = 'bold 60px Poppins'
        ctx.fillText(name, 112, 88)

        createTextGroup(ctx, `Level ${level}`, `${xp} xp`, 40, 140)
        createTextGroup(ctx, matchtime, 'spent ingame', 40, 220)
        createTextGroup(ctx, 'Most Played', '', 40, 300)

        if (mostPlayed.legend) {
            try {
                const mostPlayedLegend = await loadImage(`${WEBSITE_URL}/icons/legends/${mostPlayed.legend}.png`)
                ctx.drawImage(mostPlayedLegend, 40, 310, 48, 48)
            } catch {}
        }

        if (mostPlayed.weapon) {
            try {
                const mostPlayedWeapon = await loadImage(`${WEBSITE_URL}/icons/weapons/${mostPlayed.weapon}.png`)
                ctx.drawImage(mostPlayedWeapon, 100, 310, 48, 48)
            } catch {}
        }
        return canvas
    } catch {
        throw 'Failed to create player canvas'
    }
}
