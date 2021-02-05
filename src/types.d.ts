interface LevelDesc {
	assetDir: string;
	background: string;
	levelName: string;
	cameraBounds: Bounds;
	spawnBotBounds: Bounds;
	platforms: Platform[];
	movingPlatforms: Platform[]; //TODO: moving platform type
	collisions: Collision[];
	dynamicCollisions: DynamicCollision[];
	spawns: Spawn[];
	themes: string[];
	animations: PlatformAnimation[];
}

interface Bounds {
	x: number;
	y: number;
	w: number;
	h: number;
}

interface MapNode {
	id: string;
	isDragging: boolean;
}

interface Platform extends MapNode, Bounds {
	assetName?: string;
	instanceName: string;
	scaleX?: number;
	scaleY?: number;
	rotation?: number;
	platforms: Platform[];
	assets: Asset[];
	themes: string[];
	platId: string;
}

type Asset = Omit<Platform, 'assets' | 'platforms'>;

interface PlatformAnimation {
	platId: string;
	numFrames: number;
	x: number;
	y: number;
	keyframes: PlatformKeyframe[];
	slowMult: number;
}

interface PlatformKeyframe {
	frameNum: number;
	x: number;
	y: number;
}

type CollisionType = 'Hard' | 'Soft';

interface Collision extends MapNode {
	type: CollisionType;
	platId?: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

interface DynamicCollision {
	platId: string;
	x: number;
	y: number;
	collisions: Collision[];
}

// interface Spawn extends MapNode {
// 	type: 'Respawn' | 'ItemSpawn';
// 	init: boolean;
// 	x: number;
// 	y: number;
// }

// interface NavNode extends MapNode {
// 	navID: string;
// 	path: NavNode[];
// 	x: number;
// 	y: number;
// }
