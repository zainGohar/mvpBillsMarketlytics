var express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { audioController } = require("../controllers");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await audioController.convertAudioTofile(req, res);
});

module.exports = router;
