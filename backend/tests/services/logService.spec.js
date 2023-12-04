const { getLogFilenames } = require("../../src/daos/logFileDao");
const logService = require("../../src/services/logService");
const fs = require("fs");

const defaultDir = `${__dirname}/log_files`;

jest.mock("../../src/conf", () => {
  return {
    getConfig: () => ({
      MAX_RESPONSE_SIZE: 100,
      MAX_CHUNK_SIZE: 10,
      LOG_PATH: `${__dirname}/log_files`
    })
  }
});

const bigFilename = `${defaultDir}/big.txt`;
function createBigFile() {
  const over100BytesOfData = new Array(100).fill("fooBar\n").reduce((acc, str) => acc+str, "");
  fs.writeFileSync(bigFilename, over100BytesOfData);
}

function cleanupBigFile() {
  fs.rmSync(bigFilename);
}

describe('logService', () => {
  describe('getLogFile', () => {
    const filename = "sample.txt";
    describe('happy paths', () => {
      it('should get valid empty file', async () => {
        const expectedResponse = JSON.stringify({
          logs: [],
          scanned: 0,
          count: 0
        })

        const res = await logService.getLogFile("empty.txt");

        expect(res).toEqual({ status: 200, response: expectedResponse });
      });
      it('should get valid file with all logs in inverse order', async () => {
        const expectedResponse = JSON.stringify({
          logs: [
            "log9",
            "log8",
            "log7",
            "log6",
            "log5",
            "log4",
            "log3",
            "log2",
            "log1",
          ],
          scanned: 9,
          count: 9
        })

        const res = await logService.getLogFile(filename);

        expect(res).toEqual({ status: 200, response: expectedResponse });
      });

      it('should get specified number of logs for a file', async () => {
        const expectedResponse = JSON.stringify({
          logs: [
            "log9",
          ],
          scanned: 1,
          count: 1
        });

        const res = await logService.getLogFile(filename, { entries: 1 });

        expect(res).toEqual({ status: 200, response: expectedResponse });
      });
      
      it('should get filtered logs for a file', async () => {
        const expectedResponse = JSON.stringify({
          logs: [
            "log1",
          ],
          scanned: 9,
          count: 1
        });

        const res = await logService.getLogFile(filename, { filter: "log1" });

        expect(res).toEqual({ status: 200, response: expectedResponse });
      });

      it('should get filtered logs of a given count for a file', async () => {
        const expectedResponse = JSON.stringify({
          logs: [
            "log9",
            "log8",
            "log7",
            "log6",
            "log5",
            "log4",
            "log3",
            "log2",
          ],
          scanned: 9,
          count: 8
        });

        const res = await logService.getLogFile(filename, { filter: "log", entries: 8 });

        expect(res).toEqual({ status: 200, response: expectedResponse });
      });

      it('should honor the max response size if file is too large', async () => {
        createBigFile();

        const expectedResponse = JSON.stringify({
          logs: new Array(14).fill("fooBar"),
          scanned: 14,
          count: 14,
        });

        const res = await logService.getLogFile("big.txt");

        expect(res).toEqual({ status: 200, response: expectedResponse });

        cleanupBigFile();
      });
    });
    describe('sad paths', () => {
      it('should respond with an error for a bad filename', async () => {
        const file = "BAD#@&*()";
        const res = await logService.getLogFile(file);
        expect(res).toEqual({ response: "Bad filename.", status: 400 })
      });

      it('should respond with an error for a non number entries', async () => {
        const entries = "#@&*()";
        const res = await logService.getLogFile(filename, { entries });
        expect(res).toEqual({ response: "Entries are not a number.", status: 400 })
      });

      it('should respond with an error for a non existent log file', async () => {
        const file = "missing.txt";
        const res = await logService.getLogFile(file);
        expect(res).toEqual({ response: "File not found", status: 404 })
      });
    });
  });
  describe('getLogFilenames', () => {
    it('should get file names from provided dir', () => {
      const filenames = getLogFilenames(defaultDir);

      expect(filenames).toEqual([
        "empty.txt",
        "sample.txt"
      ])
    });
  });
});