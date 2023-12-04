const fs = require("fs");
const {
  MAX_RESPONSE_SIZE,
  MAX_CHUNK_SIZE,
} = require("../conf").getConfig();

/**
 * TODO: Basic logic for next token. Includes relevant info for next batch.
    const crypto = require("crypto");
    function hashString(str) {
      return crypto.createHash("sha256").update(str).digest("hex")
    }

    function createNextToken(last, start) {
      const tokenObj = {
        last: hashString(last),
        start
      };
      return Buffer.from(JSON.stringify(tokenObj)).toString("base64");
    }

    function filterToFound(logBatch, lastFoundLog) {
      for (let i = logBatch.length - 1; i >= 0; i--) { // Work backwards because logs prior to lastFound were returned
        if (hashString(logBatch[i]) === lastFoundLog) {
          console.log("Match: ", logBatch[i])
          return logBatch.slice(0, i+1);
        }
      }
    return logBatch;
    }
 */

/**
 * Filters current batch of logs, slice to match number of entries remaining, and prepares order for resulting arr.
 * 
 * @param {string[]} logBatch 
 * @param {number} entriesRemaining 
 * @param {string} filterCondition 
 * @returns 
 */
function getLogSubset(logBatch, entriesRemaining, filterCondition) {
  const filteredLogs = filterCondition ? logBatch.filter(log => log.includes(filterCondition)) : logBatch;
  const startSlice = entriesRemaining < filteredLogs.length ? filteredLogs.length - entriesRemaining : 0;
  const logSubset = startSlice > 0 ? filteredLogs.slice(startSlice, filteredLogs.length) : filteredLogs;
  logSubset.reverse();
  return logSubset
}

/**
 * Returns logs from given path in inverse order with optional queries. Also includes metadata about the query.
 * 
 * @param {string} path 
 * @param {number | undefined} entries 
 * @param {string | undefined} filter 
 * @returns 
 */
async function getLogs(path, entries, filter) {
  const fileSize = fs.statSync(path).size;
  const maxSize = Math.min(MAX_RESPONSE_SIZE, fileSize);
  let size = 0;
  let start = fileSize > MAX_CHUNK_SIZE ? fileSize - MAX_CHUNK_SIZE : 0;
  let end = start + MAX_CHUNK_SIZE;
  let logs = [];
  let hangingString = "";
  let entriesNeeded = true;
  let scanned = 0;
  while (size < maxSize && entriesNeeded) {
    const stream = fs.createReadStream(path, { start, end });
    let logBatch = []
    for await (const data of stream) {
      const lines = data.toString().split("\n");
      const lastLine = lines[lines.length - 1];
      const firstLine = lines[0];

      if (hangingString) { // Handle dangling lines that are not complete.
        const completeString = lastLine + hangingString.slice(1, hangingString.length);
        lines[lines.length - 1] = completeString;
        hangingString = "";
      }
      if (start !== 0 && firstLine !== "") {
        hangingString = firstLine
        lines.splice(0, 1)
      }
      if (firstLine === "") lines.splice(0, 1) // Remove empty new line char
      if (lastLine === "") lines.splice(lines.length - 1, 1) // Remove empty new line char
      logBatch = logBatch.concat(lines);
    }
    const entriesRemaining = entries ? entries - logs.length : logBatch.length;
    const logSubset = getLogSubset(logBatch, entriesRemaining, filter); //

    scanned += logBatch.length;
    logs = logs.concat(logSubset);
    size += end - start;
    end = start;
    start = (end - MAX_CHUNK_SIZE) > 0 ? end - MAX_CHUNK_SIZE : 0;
    entriesNeeded = entries ? logs.length < entries : true;
  }

  return {
    logs,
    scanned,
    count: logs.length,
    // ...(start > 0 && { next: createNextToken(logs[logs.length - 1], start) }) // TODO: Implement next token
  };
}

/**
 * @param {string} path 
 * @returns 
 */
function getLogFilenames(path) {
  return fs.readdirSync(path, { withFileTypes: true })
    .filter(dirEnt => !dirEnt.isDirectory())
    .map(dirEnt => dirEnt.name);
}

module.exports = {
  getLogs,
  getLogFilenames
}