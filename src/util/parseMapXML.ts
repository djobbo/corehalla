export function parseMapXML(mapXML: string): Collision[] {
	console.log(mapXML);
	const parser = new DOMParser();
	const dom = parser.parseFromString(mapXML, 'text/xml');

	console.log(
		dom.documentElement.nodeName == 'parsererror'
			? 'error while parsing'
			: dom
	);

	let collisions: Collision[] = [];

	['Hard', 'Soft'].map((colType: 'Hard' | 'Soft') => {
		for (let col of dom.getElementsByTagName(`${colType}Collision`)) {
			const x = col.getAttribute('X');
			const y = col.getAttribute('Y');

			collisions.push({
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
			});
		}
	});

	console.log(collisions);

	return collisions;
}
