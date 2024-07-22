var express = require("express");
const router = express.Router();
const { ingestController } = require("../controllers");
const bodyParser = require("body-parser");
const { run } = require("../controllers/ingest");
const { saveFile } = require("../libs/saveFile");
const { response } = require("../response");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  try {
    const buffer = Buffer.from(req?.body?.buffer);
    const mimetype = req?.body?.mimetype;
    const file = {
      buffer,
      originalname: req?.body?.originalname,
      mimetype,
    };

    const runResult = await run(file);

    if (!runResult?.success) return res.status(500).json(runResult);

    const saveFileResult = await saveFile(runResult?.success?.name, file);

    if (!saveFileResult?.success) return res.status(500).json(saveFileResult);

    res.status(200).json(runResult);
  } catch (error) {
    return res.status(500).json(response(null, error, "Internal server error"));
  }
});

module.exports = router;
