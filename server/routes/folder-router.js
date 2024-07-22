var express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { folderController } = require("../controllers");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await folderController.createFolder(req, res);
});

module.exports = router;
