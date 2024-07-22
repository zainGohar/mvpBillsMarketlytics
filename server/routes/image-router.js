var express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { imageController } = require("../controllers");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  await imageController.convertImage(req, res);
});

module.exports = router;
