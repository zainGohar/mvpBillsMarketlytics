var express = require("express");
const router = express.Router();
const { chatmessageController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await chatmessageController.chat(req, res);
});

module.exports = router;
