export const cleanString = (str: string): string => {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
};
