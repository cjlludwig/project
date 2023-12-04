const router = require("express").Router();
const { 
    INTERNAL_SERVER_ERROR
} = require("../models/statusModel");
const { getLogFile, getLogFiles } = require("../services/logService");

router.get("/", async function (req, res) {
  try {
    const { response, status } = await getLogFiles();
    res.status(status).send(response);
  } catch (error) {
    console.log({ error,  path: `${req.originalUrl}` });
    res.status(INTERNAL_SERVER_ERROR).send("Failed to get l") ;
  }
});

router.get("/:filename", async function (req, res) {
  try {
    const query = req.query;
    const entries = query?.entries;
    const filter = query?.filter;
    const filename = req.params?.filename;

    const { response, status } = await getLogFile(filename, { entries, filter });
    res.status(status).send(response);
  } catch (error) {
    console.log({ error,  path: `${req.originalUrl}` });
    res.status(INTERNAL_SERVER_ERROR).send("Failed to get logs") ;
  }
});

module.exports = router;