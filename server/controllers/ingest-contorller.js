const { getObjectId } = require("../libs/id");
const { response } = require("../response");
const { run } = require("./ingest");
const multer = require("multer");
const { saveFile } = require("../libs/saveFile");
const { removeSpecialCharacters } = require("../libs/removeSpecialCharacters");

const upload = multer({
  storage: multer.memoryStorage(),
});

const acceptFiles = "application/pdf,text/csv,text/plain,application/msword";

async function ingestFile(req, res) {
  try {
    upload.single("file")(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError) {
          return res
            .status(400)
            .json(response(null, err, "File upload error."));
        } else if (err) {
          return res
            .status(500)
            .json(response(null, err, "Internal server error."));
        }
        if (!req.file) {
          return res.status(400).json(response(null, err, "No file uploaded."));
        }

        const uploadedFile = req.file;

        const originalname =
          getObjectId() +
          (await removeSpecialCharacters(uploadedFile?.originalname));

        const allowedMimeTypes = acceptFiles.split(",");
        if (!allowedMimeTypes.includes(uploadedFile?.mimetype)) {
          return res
            .status(400)
            .json(response(null, null, "Invalid file type."));
        }

        const fileData = {
          originalname,
          mimetype: uploadedFile?.mimetype,
          size: uploadedFile?.size,
          buffer: uploadedFile?.buffer,
        };

        const runResult = await run(fileData);

        if (!runResult?.success) return res.status(500).json(runResult);

        const saveFileResult = await saveFile(originalname, uploadedFile);

        if (!saveFileResult?.success)
          return res.status(500).json(saveFileResult);

        console.log({ runResult });

        res.status(200).json(runResult);
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log({ error2: error });
  }
}

module.exports = {
  ingestFile,
};
