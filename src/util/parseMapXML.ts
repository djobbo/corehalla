export function parseMapXML(mapXML: string): MapData {
	console.log(mapXML);
	const parser = new DOMParser();
	const dom = parser.parseFromString(mapXML, 'text/xml');

	const levelDesc = dom.getElementsByTagName(`LevelDesc`)[0];

	let mapData: MapData = {
		assetDir: levelDesc.getAttribute('AssetDir'),
		background: levelDesc.getAttribute('Background'),
		levelName: levelDesc.getAttribute('LevelName'),
		cameraBounds: { x: 0, y: 0, w: 0, h: 0 },
		spawnBotBounds: { x: 0, y: 0, w: 0, h: 0 },
		spawns: [],
		platforms: [],
		collisions: [],
		themes: [],
	};

	for (let node of levelDesc.children) {
		switch (node.tagName) {
			case 'HardCollision':
				mapData.collisions.push(parseCollision(node, 'Hard'));
				break;
			case 'SoftCollision':
				mapData.collisions.push(parseCollision(node, 'Soft'));
				break;
			case 'CameraBounds':
				mapData.cameraBounds = parseBounds(node);
				break;
			case 'SpawnBotBounds':
				mapData.spawnBotBounds = parseBounds(node);
				break;
			case 'Platform':
				const p = parsePlatform(node);
				mapData.platforms = [...mapData.platforms, p[0]];
				mapData.themes = [...mapData.themes, ...p[1]];
			default:
				break;
		}
	}

	mapData.themes = [...new Set(mapData.themes)]
		.map((t) => t.split(','))
		.flat();
	console.log('Themes', mapData.themes);

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

function parseCollision(col: Element, colType: 'Hard' | 'Soft'): Collision {
	const x = col.getAttribute('X');
	const y = col.getAttribute('Y');

	return {
		id: Math.random().toString(),
		type: colType,
		isDragging: false,
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

function parsePlatform(platform: Element): [Platform, string[]] {
	let themes: string[] = platform.getAttribute('Theme')?.split(',') ?? [];

	let outPlatform: Platform = {
		id: Math.random().toString(),
		isDragging: false,
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
		themes,
	};

	let childPlatforms: Platform[] = [];

	for (let child of platform.children) {
		const p = parsePlatform(child);
		childPlatforms = [...childPlatforms, p[0]];
		themes = [...themes, ...p[1]];
	}

	return [{ ...outPlatform, children: childPlatforms }, themes];
}
