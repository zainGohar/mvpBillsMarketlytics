var express = require("express");
const router = express.Router();
const { fileController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await fileController.ingestFile(req, res);
});

module.exports = router;
