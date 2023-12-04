# Project
A way to provide on-demand monitoring of various unix-based servers without having to log into each individual machine and opening up the log files found in `/var/log`. The customer has asked for the ability to issue a REST request to a machine in order to retrieve logs from `/var/log` on the machine receiving the REST request.
## Usage
To use both frontend and backend start both dirs in separate terminal instances.

### Requirements
* Unix Based OS (Mac, Linux, Docker Container)
* Node
* NPM

### Backend
All HTTP server logic is housed in the `backend` dir. `cd` to that directory to interact with.

Install - Install project dependencies.
```sh
~/project/backend npm install
```

Start - Start local server.
```sh
~/project/backend npm start
```

Test - Run defined test cases.
```sh
~/project/backend npm test
```

### Frontend
All UI code is housed in the `frontend` dir. `cd` to that directory to interact with.

Install - Install project dependencies.
```sh
~/project/frontend npm install
```

Start - Start local server.
```sh
~/project/frontend npm start
```
### API
Basic endpoints to enable retrieval of logs on a server.
```http
# Get available files.
GET http://localhost:9000/api/v1/logs

# Get specific file
GET http://localhost:9000/api/v1/logs/:filename

# Additional queries for file search
GET http://localhost:9000/api/v1/logs/:filename?entries={ENTRIES}&filter={FILTER}
```

## Design
[See Design Doc](./__docs/design.md)

## Bonus
[See Bonus Doc](./__docs/bonus.md)
