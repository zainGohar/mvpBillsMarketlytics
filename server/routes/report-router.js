var express = require("express");
const router = express.Router();
const { reportController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await reportController.analyze(req, res);
});
module.exports = router;
