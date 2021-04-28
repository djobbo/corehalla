export const saveToLocalStorage = <T extends string | boolean | number>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    console.log('bryuh');

    window.localStorage.setItem(key, value.toString());
};

export const getFromLocalStorage = (key: string): string | undefined =>
    typeof window === 'undefined' ? undefined : window.localStorage.getItem(key);

export const getBoolFromLocalStorage = (key: string): boolean => {
    const val = getFromLocalStorage(key);
    return val === 'true';
};

export const getNumberFromLocalStorage = (key: string, defaultValue = 0): number => {
    const val = getFromLocalStorage(key);
    try {
        const num = parseInt(val, 10);
        return isNaN(num) ? defaultValue : num;
    } catch (e) {
        return defaultValue;
    }
};
