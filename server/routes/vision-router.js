var express = require("express");
const router = express.Router();
const { getSeoDetailsVision } = require("../controllers");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  console.log("req", req.body);
  await getSeoDetailsVision.generateProduct(req, res);
});

router.post("/re-generate", async function (req, res) {
  console.log("req", req.body);
  await getSeoDetailsVision.reGenerateProduct(req, res);
});

module.exports = router;
