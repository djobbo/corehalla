import { lerp } from './lerp';

export function getAnimationPos(
	anim: PlatformAnimation,
	frame: number
): { x: number; y: number } {
	const modFrame = ((frame / anim.slowMult) % anim.numFrames) + 1;

	const keyIndex = anim.keyframes.findIndex((k) => k.frameNum > modFrame);

	console.log(keyIndex);

	// if (keyIndex < 0) return anim.keyframes[0];

	let k1: PlatformKeyframe, k2: PlatformKeyframe;
	let t = 0;

	if (keyIndex === -1) {
		[k1, k2] = [
			anim.keyframes[anim.keyframes.length - 1],
			anim.keyframes[0],
		];
		t = (modFrame - k1.frameNum) / (anim.numFrames - k1.frameNum);
	} else {
		[k1, k2] = [anim.keyframes[keyIndex - 1], anim.keyframes[keyIndex]];
		t = (modFrame - k1.frameNum) / (k2.frameNum - k1.frameNum);
	}

	return {
		x: lerp(k1.x, k2.x, t),
		y: lerp(k1.y, k2.y, t),
	};
}
