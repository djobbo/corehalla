export const cleanString = (str: string) => {
	try {
		return decodeURIComponent(escape(str));
	} catch (e) {
		return str;
	}
};
