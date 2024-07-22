var express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { deleteFiles } = require("../libs/deleteFile");
const { response } = require("../response");
const { folderPath } = require("../libs/common");
router.use(bodyParser.json());

router.delete("/", async function (req, res) {
  const file_id = req.query["file_id"];
  const storage_type = req.query["storage_type"];
  if (typeof file_id === "undefined")
    return res
      .status(500)
      .json(response(null, null, "incomplete credentials!"));

  const data = await deleteFiles(file_id, folderPath, storage_type);
  console.log({ data });
  if (!data?.success)
    return res.status(500).json(response(null, null, data.message.content));

  return res
    .status(200)
    .json(response(data, null, "file deleted successfully"));
});

module.exports = router;
