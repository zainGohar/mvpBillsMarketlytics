const { response } = require("../response");
const { saveFile } = require("../libs/saveFile");
const multer = require("multer");
const {
  convertStringToBoolean,
  folderPath,
  openAIClient,
} = require("../libs/common");
const { deleteFiles } = require("../libs/deleteFile");

const acceptFiles = "image/jpeg,image/jpg,image/png,image/gif";

const upload = multer({
  storage: multer.memoryStorage(),
});

async function chatwithImage(req, res) {
  const openai = await openAIClient();

  upload.any("files")(req, res, async (err) => {
    const streaming = convertStringToBoolean(req.body?.streaming);

    let stream;
    if (streaming !== undefined && streaming !== null) {
      stream = streaming;
    } else {
      stream = true;
    }
    if (stream) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
    }

    if (err instanceof multer.MulterError) {
      return sendErrorResponse(res, "File upload error.");
    } else if (err) {
      return sendErrorResponse(res, err);
    }

    const {
      files,
      body: { question, storageType },
    } = req;

    if (!files?.length) {
      return sendErrorResponse(res, "No file uploaded.");
    }
    if (!question) {
      return sendErrorResponse(res, "No question in the request");
    }

    const sendData = (data) => {
      res.write(`data: ${data}\n\n`);
    };

    const imageObjects = [];
    const file_ids = [];

    for (let i = 0; i < files?.length; i++) {
      const file = files[i];
      const allowedMimeTypes = acceptFiles.split(",");
      if (!allowedMimeTypes.includes(file?.mimetype)) {
        return sendErrorResponse(
          res,
          `Invalid file type. (${file?.originalname})`
        );
      }

      const saveFileResult = await saveFile(
        file.originalname,
        file,
        storageType
      );
      console.log({ saveFileResult });
      if (!saveFileResult?.success) {
        if (file_ids?.length) {
          for (let i = 0; i < file_ids?.length; i++) {
            await deleteFiles(file_ids[i], folderPath, storageType);
          }
        }
        return sendErrorResponse(res, saveFileResult.message.content);
      }
      file_ids.push(saveFileResult?.success?.file_id);
      imageObjects.push({
        type: "image_url",
        image_url: {
          url:
            saveFileResult?.success?.storageType == "aws"
              ? saveFileResult?.success?.path
              : `data:image/jpeg;base64,${file.buffer.toString("base64")}`,
        },
      });
    }

    try {
      const object = {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `I want you to write me a descriptions of these given image(s) according to the question (${question}). These may be the different images of the same product so provide only one detail.
                      If the image contains multiple objects then write a description for largest prominent object.\n
                      Must return response, doesn't matter if picture depicts something other than mentioned in given question.`,
              },
              ...imageObjects,
            ],
          },
        ],
        max_tokens: 4000,
      };
      const source = imageObjects?.map((i) => i?.image_url)?.map((u) => u?.url);
      if (stream) {
        const streamResult = await openai.beta.chat.completions.stream(object);
        streamResult.on("content", (delta, snapshot) => {
          sendData(JSON.stringify({ message: delta }));
        });
        streamResult
          .finalChatCompletion()
          .then(() => {
            sendData(JSON.stringify({ source: source }));
            res.write(`event: closed\ndata: [DONE]\n\n`);
            res.end();
          })
          .catch((error) => sendErrorResponse(res, error));
      } else {
        const result = await openai.chat.completions.create(object);
        res.status(200).json({
          text: result.choices[0].message.content,
          source: source,
        });
      }
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  });
}

const sendErrorResponse = async (res, error) => {
  const errorMessage = typeof error === "string" ? error : "";
  const err =
    typeof error === "string"
      ? JSON.stringify({ error: { message: error } })
      : JSON.stringify(error);
  if (!res.headersSent) {
    res.status(500).json(response(null, err, errorMessage));
  } else {
    res.write(`event: error\ndata: ${err}\n\n`);
    res.end();
  }
};

module.exports = {
  chatwithImage,
};
