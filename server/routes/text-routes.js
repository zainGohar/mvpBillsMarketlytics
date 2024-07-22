var express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { textController } = require("../controllers");
router.use(bodyParser.json());

router.post("/file", async function (req, res) {
  await textController.insertText(req, res);
});

router.post("/", async function (req, res) {
  await textController.convertTextToFile(req, res);
});
module.exports = router;
