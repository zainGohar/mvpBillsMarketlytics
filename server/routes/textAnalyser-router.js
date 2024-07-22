var express = require("express");
const router = express.Router();
const { textAnalyserController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await textAnalyserController.analyseEntities(req, res);
});

router.post("/doc", async function (req, res) {
  await textAnalyserController.analyseDocument(req, res);
});

module.exports = router;
