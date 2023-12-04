const FILENAME_REGEX = /^[\w\-. ]+$/

function validateFilename(filename) {
    if (!filename) return "Missing required filename.";
    if (!FILENAME_REGEX.test(filename)) return "Bad filename."
    return "";
}

function validateFilter(filter) {
    if (filter === undefined) return ""
    return "";
}
function validateEntries(entries) {
    if (entries === undefined) return ""
    if (isNaN(entries)) return "Entries are not a number.";
    return "";
}

function validateLogQuery(filename, query) {
    const filenameError = validateFilename(filename);
    if (filenameError) return filenameError;

    const { filter, entries } = query;
    const filterError = validateFilter(filter);
    if (filterError) return filterError;

    const entriesError = validateEntries(entries);
    if (entriesError) return entriesError;

    return "";
}

module.exports = {
    validateLogQuery
}