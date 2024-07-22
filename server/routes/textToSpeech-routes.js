var express = require("express");
const router = express.Router();
const { textToSpeechController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await textToSpeechController.textToSpeech(req, res);
});

module.exports = router;
