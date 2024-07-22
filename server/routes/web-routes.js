var express = require("express");
const router = express.Router();
const { webController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await webController.convertURLToFile(req, res);
});

router.post("/text", async function (req, res) {
  await webController.insertWebLink(req, res);
});

module.exports = router;
