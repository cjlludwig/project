# Bonus
Add the ability to issue a REST request to one “primary” server which subsequently requests those logs from a list of “secondary” servers There aren’t any hard requirements for the protocol used between the primary and secondary servers, and the architecture is completely up to you.

## System
Rough system design.
```mermaid
flowchart
   user((User))<-->host
   subgraph host["Host"]
      direction TB
      queryLogFiles[["Query for log files"]]-->queryForHost
      queryForHost[["Query for hostnames"]]-->queryLogs
      queryLogs[["Query Logs"]]
   end
   host<-->servers
   subgraph servers
      direction TB
      server1-->log1[(log1)]
      server1-->log2[(log2)]
      server2-->log3[(log1)]
      server2-->log4[(log3)]
      server3-->log5[(log1)]
   end

   host-->|query available|serverDb
   servers-->|Check-in|serverDb
   serverDb[("Server DB")]
```

```mermaid
erDiagram
   serverDb {
      string machine_id "PK"
      string hostname "Url for API."
   }
   logFileDb {
      string machine_id
      string log_file_name
   }
```

Envisioned basic API structure:
```http
# Return a list of all available machines on network.
GET http://{HOSTNAME}/api/v1/machines

# Return a list of all log files available on a given machine
GET http://{HOSTNAME}/api/v1/machines/:id/logs/

# Return logs for given file on a given machine
GET http://{HOSTNAME}/api/v1/machines/:id/logs/:filename?entires={ENTRIES}&filter={filter}
```
