export function createMapXML(mapData: LevelDesc) {
	let outStr = `<LevelDesc AssetDir="${mapData.assetDir}" Background="${mapData.background}" LevelName="${mapData.levelName}">\n`;
	outStr += `    <CameraBounds H="${mapData.cameraBounds.h}" W="${mapData.cameraBounds.w}" X="${mapData.cameraBounds.x}" Y="${mapData.cameraBounds.y}"/>\n`;
	outStr += `    <SpawnBotBounds H="${mapData.spawnBotBounds.h}" W="${mapData.spawnBotBounds.w}" X="${mapData.spawnBotBounds.x}" Y="${mapData.spawnBotBounds.y}"/>\n`;

	mapData.collisions.forEach((col) => {
		outStr += `    <${col.type}Collision ${
			col.x1 === col.x2
				? `X="${col.x1}"`
				: `X1="${col.x1}" X2="${col.x2}"`
		} ${
			col.y1 === col.y2
				? `Y="${col.y1}"`
				: `Y1="${col.y1}" Y2="${col.y2}"`
		}/>\n`;
	});

	outStr += '</LevelDesc>';

	return outStr;
}
