function cleanString(name) {
	try{
		fixedstring=decodeURIComponent(escape(name));
	}catch(e){
		fixedstring=name;
	}
	return fixedstring;
}

module.exports = cleanString;