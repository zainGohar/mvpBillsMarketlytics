var express = require("express");
const router = express.Router();
const { videoController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await videoController.convertVideoTofile(req, res);
});

module.exports = router;
