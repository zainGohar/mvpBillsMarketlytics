const { createTextFile } = require("../libs/convertToFile");
const { response } = require("../response");
const fetch = require("node-fetch");
const { getObjectId } = require("../libs/id");
const { run } = require("./ingest");
const { saveFile } = require("../libs/saveFile");
const multer = require("multer");
const { audioToText } = require("../libs/audioToText");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const acceptFiles = "audio/mpeg,audio/wav,audio/ogg,audio/mp4";

async function convertAudioTofile(req, res) {
  upload.single("file")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json(response(null, err, "File size exceeds the limit."));
      } else {
        return res.status(400).json(response(null, err, "File upload error."));
      }
    } else if (err) {
      return res
        .status(500)
        .json(response(null, err, "Internal server error."));
    }

    if (!req.file) {
      return res.status(400).json(response(null, err, "No file uploaded."));
    }

    const uploadedFile = req.file;
    const nameFile = getObjectId() + uploadedFile?.originalname;

    const allowedMimeTypes = acceptFiles.split(",");
    if (!allowedMimeTypes.includes(uploadedFile?.mimetype)) {
      return res.status(400).json(response(null, null, "Invalid audio type."));
    }

    const audioFileResult = await getAudioData(uploadedFile);

    if (!audioFileResult?.success) return res.status(500).json(audioFileResult);

    const file = await createTextFile(
      nameFile,
      audioFileResult?.success?.textContent
    );

    const runResult = await run(file);

    if (!runResult?.success) return res.status(500).json(runResult);

    const saveFileResult = await saveFile(runResult?.success?.name, file);
    if (!saveFileResult?.success) return res.status(500).json(saveFileResult);

    res.status(200).json(runResult);
  });
}

async function getAudioData(audio) {
  try {
    const result = await audioToText({ buffer: audio.buffer });

    if (!result.status) return response(null, result, "Unreadable data!");
    let textContent = result?.text;
    if (!textContent) return response(null, result, "Audio file is empty!");

    return response(
      {
        textContent,
        no_of_characters: textContent?.length,
      },
      null,
      "convert to text successfully"
    );
  } catch (error) {
    (error) => {
      return response(null, error, "Unreadable data!");
    };
  }
}

module.exports = {
  convertAudioTofile,
};
