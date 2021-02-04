export function createMapXML(cols: Collision[]) {
	let outStr =
		'<LevelDesc AssetDir="Enigma" Background="BG_Steam.jpg" LevelName="SmallEnigma">\n';
	outStr += '    <CameraBounds H="2772" W="4928" X="-1364" Y="278.15"/>\n';
	outStr += '    <SpawnBotBounds H="1850" W="2680" X="-110" Y="560"/>\n';

	cols.forEach((col) => {
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
