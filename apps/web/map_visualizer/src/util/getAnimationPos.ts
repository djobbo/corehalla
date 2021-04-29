import { lerp } from './lerp';
import { mod } from './mod';

export function getAnimationPos(
    anim: PlatformAnimation,
    frame: number,
    levelDesc: LevelDesc,
): { x: number; y: number } {
    const modFrame = mod(frame / anim.slowMult / levelDesc.slowMult, anim.numFrames || levelDesc.numFrames) + 1;

    const keyIndex = anim.keyframes.findIndex((k) => k.frameNum > modFrame);

    let key1: PlatformKeyframe | PlatformPhase, key2: PlatformKeyframe | PlatformPhase;
    let t = 0;

    if (keyIndex === -1) {
        [key1, key2] = [anim.keyframes[anim.keyframes.length - 1], anim.keyframes[0]];
        t = anim.numFrames - key1.frameNum === 0 ? 0 : (modFrame - key1.frameNum) / (anim.numFrames - key1.frameNum);
    } else if (keyIndex === 0) {
        const key = anim.keyframes[0];
        return key.type === 'Phase' ? key.keyFrames[0] : key;
    } else {
        [key1, key2] = [anim.keyframes[keyIndex - 1], anim.keyframes[keyIndex]];
        t = (modFrame - key1.frameNum) / (key2.frameNum - key1.frameNum);
    }

    if (key1.type === 'Phase')
        return getAnimationPos({ ...anim, keyframes: key1.keyFrames }, modFrame - key1.frameNum, levelDesc);

    if (key2.type === 'Phase') return key1;
    // return {
    // 	x: lerp(key1.x, key2.keyFrames[0].x, t),
    // 	y: lerp(key1.y, key2.keyFrames[0].y, t),
    // };

    return {
        x: lerp(key1.x, key2.x, t),
        y: lerp(key1.y, key2.y, t),
    };
}
