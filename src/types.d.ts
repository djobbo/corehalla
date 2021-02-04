interface MapData {
	assetDir: string;
	background: string;
	levelName: string;
	cameraBounds: Bounds;
	spawnBotBounds: Bounds;
	collisions: Collision[];
	platforms: Platform[];
	spawns: Spawn[];
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
	children?: Platform[];
}

interface Collision extends MapNode {
	type: 'Hard' | 'Soft';
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

interface Spawn extends MapNode {
	type: 'Respawn' | 'ItemSpawn';
	init: boolean;
	x: number;
	y: number;
}

interface NavNode extends MapNode {
	navID: string;
	path: NavNode[];
	x: number;
	y: number;
}
