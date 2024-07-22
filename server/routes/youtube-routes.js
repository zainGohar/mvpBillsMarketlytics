var express = require("express");
const router = express.Router();
const { youtubeController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await youtubeController.convertYoutubeTofile(req, res);
});

router.post("/text", async function (req, res) {
  await youtubeController.insertYoutubeLink(req, res);
});

module.exports = router;
