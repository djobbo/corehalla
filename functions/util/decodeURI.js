module.exports = (string) => {
    let fixedstring;
    try {
        fixedstring = decodeURIComponent(escape(string));
    } catch (e) {
        fixedstring = string;
    }
    return fixedstring;
}