function BundleTSDec({
	moduleName,
	output = './build/',
	globalDeclaration = false,
	excludedReferences = undefined,
}) {
	if (!moduleName) throw new Error('Please set a moduleName');

	this.moduleName = moduleName;
	this.output = output;
	this.excludedReferences = excludedReferences;
	this.globalDeclaration = globalDeclaration;

	this.generateCombinedDeclaration = (declarationFiles) => {
		let declarations = Object.entries(declarationFiles).reduce(
			(acc, [_, data]) => {
				const lines = data.source().split('\n');
				if (!lines) return acc;
				let i = lines.length - 1;

				while (i--) {
					const line = lines[i];

					// Exclude empty lines | export statements | import statements
					const excludeLine =
						line === '' ||
						line.indexOf('export =') !== -1 ||
						/import ([a-z0-9A-Z_-]+) = require\(/.test(line);

					// If defined, check for excluded references
					if (
						!excludeLine &&
						this.excludedReferences &&
						line.indexOf('<reference') !== -1
					)
						excludeLine = this.excludedReferences.some(
							(reference) => line.indexOf(reference) !== -1
						);

					if (excludeLine) lines.splice(i, 1);
					else if (!globalDeclaration) {
						if (line.indexOf('declare ') !== -1)
							lines[i] = line.replace('declare ', '');
						lines[i] = '\t' + lines[i]; // Add Tab
					}
				}
				return acc + lines.join('\n') + '\n';
			},
			''
		);
		return globalDeclaration
			? declarations
			: `declare module ${this.moduleName}\n{\n${declarations} }`;
	};
}

BundleTSDec.prototype.apply = function (compiler) {
	compiler.hooks.emit.tapAsync('TestPlugin', ({ assets }, callback) => {
		const declarationFiles = Object.entries(assets).reduce(
			(acc, [fileName, data]) => {
				if (fileName.indexOf('.d.ts') === -1) return acc;

				delete assets[fileName];
				return { ...acc, [fileName]: data };
			},
			{}
		);

		const combinedDeclaration = this.generateCombinedDeclaration(
			declarationFiles
		);

		assets[this.output] = {
			source: () => combinedDeclaration,
			size: () => combinedDeclaration.length,
		};

		callback();
	});
};

module.exports = BundleTSDec;
