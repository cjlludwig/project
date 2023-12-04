const express = require('express');
const cors = require("cors")
const app = express();
const logController = require("./controllers/logController");
const {
    PORT,
    API_PREFIX
} = require("./conf").getConfig();

app.use(express.json());
app.use(cors()); // Allow calls from localhost UI.
app.use(`${API_PREFIX}/logs`, logController);

const server = app.listen(PORT, () => {
  console.log(`Backend started: http://localhost:${PORT}`);
})

process.on('SIGTERM', async () => {
  console.log("Shutting down backend.");
  server.close(() => {
    console.log('HTTP server closed');
  });
})

module.exports = app;