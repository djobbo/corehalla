export const cleanString = (str: string) => {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
};
