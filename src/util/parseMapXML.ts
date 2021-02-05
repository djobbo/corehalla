import { parse } from 'postcss';

export function parseMapXML(mapXML: string): LevelDesc {
	console.log(mapXML);
	const parser = new DOMParser();
	const dom = parser.parseFromString(mapXML, 'text/xml');

	const levelDesc = dom.getElementsByTagName(`LevelDesc`)[0];

	let mapData: LevelDesc = {
		assetDir: levelDesc.getAttribute('AssetDir'),
		background: levelDesc.getAttribute('Background'),
		levelName: levelDesc.getAttribute('LevelName'),
		cameraBounds: { x: 0, y: 0, w: 0, h: 0 },
		spawnBotBounds: { x: 0, y: 0, w: 0, h: 0 },
		spawns: [],
		platforms: [],
		movingPlatforms: [],
		collisions: [],
		dynamicCollisions: [],
		themes: [],
		animations: [],
	};

	for (let node of levelDesc.children) {
		switch (node.tagName) {
			case 'HardCollision':
				mapData.collisions.push(parseCollision(node, 'Hard'));
				break;
			case 'SoftCollision':
				mapData.collisions.push(parseCollision(node, 'Soft'));
				break;
			case 'DynamicCollision':
				mapData.dynamicCollisions.push(parseDynamicCollision(node));
				break;
			case 'CameraBounds':
				mapData.cameraBounds = parseBounds(node);
				break;
			case 'SpawnBotBounds':
				mapData.spawnBotBounds = parseBounds(node);
				break;
			case 'Platform':
			case 'MovingPlatform':
				const p = parsePlatform(node);
				if (node.tagName === 'Platform')
					mapData.platforms = [...mapData.platforms, p.platform];
				else
					mapData.movingPlatforms = [
						...mapData.movingPlatforms,
						p.platform,
					];

				if (p.animation)
					mapData.animations = [
						...new Set([...mapData.animations, p.animation]),
					];

				mapData.themes = [...mapData.themes, ...p.themes];
				break;
			default:
				break;
		}
	}

	mapData.themes = [...new Set(mapData.themes)]
		.map((t) => t.split(','))
		.flat();

	console.log('LevelDesc', mapData);

	return mapData;
}

function parseBounds(bounds: Element): Bounds {
	return {
		x: parseFloat(bounds.getAttribute('X')),
		y: parseFloat(bounds.getAttribute('Y')),
		w: parseFloat(bounds.getAttribute('W')),
		h: parseFloat(bounds.getAttribute('H')),
	};
}

function parseDynamicCollision(col: Element): DynamicCollision {
	let children: Collision[] = [];

	const platId = col.getAttribute('PlatID');

	for (let child of col.children) {
		switch (child.tagName) {
			case 'HardCollision':
				children.push(parseCollision(child, 'Hard'));
				break;
			case 'SoftCollision':
				children.push(parseCollision(child, 'Soft'));
				break;
			default:
				break;
		}
	}

	return {
		platId,
		collisions: children,
		x: parseFloat(col.getAttribute('X') ?? '0'),
		y: parseFloat(col.getAttribute('Y') ?? '0'),
	};
}

function parseCollision(
	col: Element,
	colType: CollisionType,
	platId = undefined
): Collision {
	const x = col.getAttribute('X');
	const y = col.getAttribute('Y');

	return {
		id: Math.random().toString(),
		type: colType,
		isDragging: false,
		platId,
		...(x
			? { x1: parseInt(x), x2: parseInt(x) }
			: {
					x1: parseInt(col.getAttribute('X1')),
					x2: parseInt(col.getAttribute('X2')),
			  }),
		...(y
			? { y1: parseInt(y), y2: parseInt(y) }
			: {
					y1: parseInt(col.getAttribute('Y1')),
					y2: parseInt(col.getAttribute('Y2')),
			  }),
	};
}

function parsePlatform(
	platform: Element
): { platform: Platform; themes: string[]; animation?: PlatformAnimation } {
	let themes: string[] = platform.getAttribute('Theme')?.split(',') ?? [];

	const platId = platform.getAttribute('PlatID');
	console.log(platId);

	let outPlatform: Platform = {
		id: Math.random().toString(),
		isDragging: false,
		platId,
		assetName: platform.getAttribute('AssetName'),
		instanceName: platform.getAttribute('InstanceName'),
		x: parseFloat(platform.getAttribute('X') ?? '0'),
		y: parseFloat(platform.getAttribute('Y') ?? '0'),
		w: parseFloat(platform.getAttribute('W') ?? '0'),
		h: parseFloat(platform.getAttribute('H') ?? '0'),
		scaleX:
			parseFloat(platform.getAttribute('ScaleX') ?? '1') *
			parseFloat(platform.getAttribute('Scale') ?? '1'),
		scaleY:
			parseFloat(platform.getAttribute('ScaleY') ?? '1') *
			parseFloat(platform.getAttribute('Scale') ?? '1'),
		rotation: parseFloat(platform.getAttribute('Rotation') ?? '0'),
		platforms: [],
		assets: [],
		themes,
	};

	let animation: PlatformAnimation;

	for (let child of platform.children) {
		if (child.tagName === 'Animation' && platId) {
			animation = parseAnimation(
				child,
				platId,
				outPlatform.x,
				outPlatform.y
			);
		} else {
			const { platform: plat, themes: th } = parsePlatform(child);
			switch (child.tagName) {
				case 'Platform':
					outPlatform.platforms.push(plat);
					break;
				case 'Asset':
					outPlatform.assets.push(plat);
					break;
				default:
					break;
			}
			themes = [...themes, ...th];
		}
	}

	console.log(outPlatform.assetName);

	return { platform: outPlatform, themes, animation };
}

function parseAnimation(
	anim: Element,
	platId: string,
	baseX = 0,
	baseY = 0
): PlatformAnimation {
	let keyframes: PlatformKeyframe[] = [];

	for (let child of anim.children) {
		if (child.tagName === 'KeyFrame') {
			const key = parseKeyframe(child, baseX, baseY);
			keyframes.push(key);
		}
	}

	return {
		platId,
		numFrames: parseInt(anim.getAttribute('NumFrames') ?? '0'),
		keyframes,
		x: baseX,
		y: baseY,
		slowMult: parseFloat(anim.getAttribute('SlowMult') ?? '1'),
	};
}

function parseKeyframe(key: Element, baseX = 0, baseY = 0): PlatformKeyframe {
	return {
		frameNum: parseInt(key.getAttribute('FrameNum')),
		x: parseFloat(key.getAttribute('X') ?? '0'),
		y: parseFloat(key.getAttribute('Y') ?? '0'),
	};
}
