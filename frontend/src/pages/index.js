import * as React from "react"
const { useState } = React;

const IndexPage = () => {
  const [filename, setFilename] = useState("");
  const [entries, setEntries] = useState("");
  const [filter, setFilter] = useState("");
  const [logs, setLogs] = useState(undefined);
  const [count, setCount] = useState(undefined);
  const [scanned, setScanned] = useState(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addQuery(url) {
    if (filter || entries) {
      let updated = url + "?";
      if (filter && entries) {
        updated += `filter=${filter}&entries=${entries}`;
      } else {
        if (filter) updated += `filter=${filter}`;
        if (entries) updated += `entries=${entries}`;
      }
      return updated;
    }
    return url;
  }
  async function getLogs() {
    const baseUrl = `http://localhost:9000/api/v1/logs/${filename}`;
    const fullUrl = addQuery(baseUrl);
    try {
      setLoading(true);
      setLogs([])
      const res = await fetch(fullUrl, { method: "GET" });
      setLoading(false);
      if (res.ok) {
        const results = await res.json();
        if (results?.logs) setLogs(results?.logs);
        if (results?.count) setCount(results?.count);
        if (results?.scanned) setScanned(results?.scanned);
      } else {
        const baseError = `ERROR: Server responded with - ${res.status}`;
        const validationError = await res.text();
        const errorMessage = validationError ? `${baseError} ${validationError}` : baseError;
        console.log("FAILED GET: ", errorMessage);
        setLogs(undefined);
        setError(errorMessage);
      }
    } catch (error) {
      console.log("FAILED FETCH: ", error);
    }
  }

  return (
    <main>
      <div
        style={{
          margin: "auto",
          width: "50%"
        }}
      >
        <span>
          <input
            type="text"
            placeholder={"Input log filename."}
            onChange={e => setFilename(e.target.value)}
          />
          <input
            style={{ marginLeft: "5px" }}
            type="text"
            placeholder={"(Optional) Input entries."}
            onChange={e => setEntries(e.target.value)}
          />
          <input
            style={{ marginLeft: "5px" }}
            type="text"
            placeholder={"(Optional) Input filter."}
            onChange={e => setFilter(e.target.value)}
          />
          <button
            type="button"
            style={{ marginLeft: "5px" }}
            onClick={getLogs}
          >Get Logs
          </button>
        </span>
        {loading &&
          <div>Loading...</div>
        }
        {!!logs && !!logs.length &&
          <div>
            <span>Count: {count}  Scanned: {scanned}</span>
            <ol>
              {
                logs.map((log, i) => (<li key={`log-${i}`}>{log}</li>))
              }
            </ol>
          </div>
        }
        {!!logs && logs.length === 0 && count === 0 &&
          <div>
            <span>Count: {count}  Scanned: {scanned}</span>
            <div>No logs found in that file.</div>
          </div>
        }
        {!!error &&
          <div>{error}</div>
        }
      </div>
    </main>
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>
