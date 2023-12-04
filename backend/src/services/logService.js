const logModel = require("../models/logModel");
const { getLogs, getLogFilenames } = require("../daos/logFileDao");
const { 
  BAD_REQUEST, 
  NOT_FOUND, 
  OK 
} = require("../models/statusModel");
const {
  LOG_PATH,
} = require("../conf").getConfig();

/**
 * Defining complex objects for intellisense.
 * 
 * @typedef QueryParams
 * @property {(string | undefined)} filter
 * @property {(string | undefined)} entries
 * 
 * @typedef Response
 * @property {string} response
 * @property {number} status
 */

/**
 * Returns the lines from a given log file in inverse order. Optionally allows additional querying.
 * @param {(string | undefined)} filename
 * @param {QueryParams} query
 * @returns {Promise<Response>}
 */
async function getLogFile(filename = "", query = {}) {
  const validationError = logModel.validateLogQuery(filename, query);
  if (validationError) return { response: validationError, status: BAD_REQUEST };

  const { filter, entries } = query;
  const entriesValue = parseInt(entries);
  const path = `${LOG_PATH}/${filename}`;
  try {
    const result = await getLogs(path, entriesValue, filter);
    const response = JSON.stringify(result)
    return { response, status: OK };
  } catch (error) {
    if (error?.code === "ENOENT") return { response: "File not found", status: NOT_FOUND };
    throw error;
  }
}

/**
 * Returns the available log filenames.
 * @returns {Promise<Response>}
 */
async function getLogFiles() {
  const filenames = getLogFilenames(LOG_PATH);
  return { response: JSON.stringify({ filenames }), status: OK };
}

module.exports = {
  getLogFile,
  getLogFiles
}