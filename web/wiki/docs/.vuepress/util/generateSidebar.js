const glob = require('glob');

const getChildren = (parent_path, dir) => {
	return glob
		.sync(parent_path + '/' + dir + '/**/*.md')
		.map((path) => {
			path = path.slice(parent_path.length + 1, -3);
			if (path.endsWith('README')) path = path.slice(0, -6);
			return path;
		})
		.sort();
};

exports.generateSidebar = (parent_path, dir) => {
	console.log(getChildren(parent_path, dir));
};
