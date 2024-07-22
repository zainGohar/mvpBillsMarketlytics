const { createTextFile } = require("../libs/convertToFile");
const { response } = require("../response");
const { getObjectId } = require("../libs/id");
const { run } = require("./ingest");
const { saveFile } = require("../libs/saveFile");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const {
  streamToBuffer,
  createTempFile,
  unlinkAsync,
} = require("../libs/common");
const stream = require("stream");
const { audioToText } = require("../libs/audioToText");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const acceptFiles =
  "video/mp4,video/x-msvideo,video/x-matroska,video/quicktime";

async function convertVideoTofile(req, res) {
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
      return res.status(400).json(response(null, null, "Invalid video type."));
    }

    const videoLinkResult = await getVideoData(uploadedFile);
    if (!videoLinkResult?.success) return res.status(500).json(videoLinkResult);

    const file = await createTextFile(
      nameFile,
      videoLinkResult?.success?.textContent
    );

    const runResult = await run(file);

    if (!runResult?.success) return res.status(500).json(runResult);

    const saveFileResult = await saveFile(runResult?.success?.name, file);

    if (!saveFileResult?.success) return res.status(500).json(saveFileResult);

    res.status(200).json(runResult);
  });
}

async function getVideoData(video) {
  const tempFilename = await createTempFile(video.originalname, video.buffer);
  try {
    let audioStream = new stream.PassThrough();
    ffmpeg(tempFilename)
      .format("mp3")
      .outputOptions([
        "-loglevel",
        "debug",
        "-c:v libx264",
        "-crf 23",
        "-preset veryfast",
        "-b:a 128k",
      ])
      .on("error", (err) => {
        console.log({ err });
      })
      .pipe(audioStream, { end: true });

    const buffer = await streamToBuffer(audioStream);
    if (!buffer) return response(null, null, "Unreadable data!");
    const result = await audioToText({
      buffer,
    });
    if (!result.status) return response(null, result, "Unreadable data!");
    let textContent = result?.text;
    return response(
      {
        textContent,
        no_of_characters: textContent?.length,
      },
      null,
      "convert to text successfully"
    );
  } catch (error) {
    return response(null, error, "Unreadable data!");
  } finally {
    await unlinkAsync(tempFilename);
  }
}

module.exports = {
  convertVideoTofile,
};
