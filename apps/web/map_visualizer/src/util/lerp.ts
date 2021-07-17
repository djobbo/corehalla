export function lerp(v0: number, v1: number, t: number): number {
    return (1 - t) * v0 + t * v1
}
