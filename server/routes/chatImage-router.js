var express = require("express");
const router = express.Router();
const { chatwithImageController } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await chatwithImageController.chatwithImage(req, res);
});

module.exports = router;
