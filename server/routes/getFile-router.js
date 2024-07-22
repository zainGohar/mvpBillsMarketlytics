var express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { getFile } = require("../libs/getFile");
const { response } = require("../response");
router.use(bodyParser.json());

router.post("/", async function (req, res) {
  const file_id = req.body["file_id"];
  const storage_type = req.body["storage_type"];

  if (typeof file_id === "undefined")
    return res
      .status(500)
      .json(response(null, null, "incomplete credentials!"));

  const data = await getFile(file_id, storage_type);

  if (!data?.success)
    return res.status(500).json(response(null, null, data.message.content));

  return res.status(200).json(data);
});

module.exports = router;
