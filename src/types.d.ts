interface MapData {
	assetDir: string;
	background: string;
	levelName: string;
	collisions: Collision[];
	platforms: Platform[];
	spawns: Spawn[];
}

interface CameraBounds {
	x: number;
	y: number;
	w: number;
	h: number;
}

interface MapNode {
	id: string;
	isDragging: boolean;
}

interface Platform extends MapNode {
	instanceName: string;
	assetName: string;
	x: number;
	y: number;
	w: number;
	h: number;
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
