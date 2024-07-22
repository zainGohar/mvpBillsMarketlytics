const OpenAI = require("openai");
const axios = require("axios");
const { response } = require("../response");
const multer = require("multer");
const config = require("../global/config");

const upload = multer({
  storage: multer.memoryStorage(),
});

const acceptFiles =
  "image/png,image/jpeg,image/gif,image/bmp,image/tiff,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/vnd.wap.wbmp,image/apng,image/avif,image/jxr,image/vnd.adobe.photoshop";

const defaultPrompt =
  "I want you to write me seo friendly descriptions of this image for selling purpose. These images are of different ecommerce products which are being sold." +
  "If the image contains multiple objects then write a description for largest prominent object. Also include keywords in descriptions. I need following formats in response.\n" +
  "short description:\n" +
  "description:\n" +
  "Keywords:\n" +
  "meta tags:\n" +
  "meta title{50-60 characters}:\n" +
  "meta description {150-160 characters}:\n" +
  "meta keywords\n" +
  " If you don't understand the image, then return empty string.";

// const defaultPrompt = "how many images are there?";

async function convertImage(req, res) {
  try {
    const apiKey = config.get("OPENAI_KEY");

    const contentType = req.headers["content-type"];

    let result = {};

    if (contentType.includes("multipart/form-data")) {
      const data = await handleFileUpload(req, res);
      console.log("data", data);
      result = await readImageBase64(apiKey, data?.filesArray, data?.prompt);
    } else if (contentType.includes("application/json")) {
      const url = req?.body?.url;
      const prompt = req?.body?.prompt;
      result = await readImageURL(apiKey, url, prompt);
    }

    if (!result.success) return res.status(result.error?.status).json(result);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(response(null, error, "Unable to read image!"));
  }
}

const handleFileUpload = (req, res) => {
  try {
    return new Promise((resolve, reject) => {
      upload.array("files")(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          reject(response(null, err, "File upload error."));
        } else if (err) {
          reject(response(null, err, "Internal server error."));
        }

        const allowedMimeTypes = acceptFiles.split(",");
        const filesArray = [];

        if (req.files) {
          for (const file of req.files) {
            if (!allowedMimeTypes.includes(file.mimetype)) {
              reject(response(null, file.mimetype, "Invalid image type."));
            }
            const imgBase64 = {
              imgBase64: Buffer.from(file.buffer).toString("base64"),
              type: file.mimetype,
            };
            filesArray.push(imgBase64);
          }
        }

        resolve({ prompt: req.body.prompt, filesArray });
      });
    });
  } catch (err) {
    console.log({ err });
  }
};

async function readImageURL(apiKey, imageURL, prompt) {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt ?? defaultPrompt,
          },
        ],
      },
    ];

    if (Array.isArray(imageURL)) {
      messages[0].content.push(
        ...imageURL.map((url) => ({
          type: "image_url",
          image_url: {
            url: url,
          },
        }))
      );
    } else {
      messages[0].content.push({
        type: "image_url",
        image_url: {
          url: imageURL,
        },
      });
    }

    const result = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: messages,
      max_tokens: 350,
    });

    return response(result.choices[0], null, "Read image successfully");
  } catch (error) {
    return response(null, error, "Unable to read image!");
  }
}

async function readImageBase64(apiKey, files, prompt) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt ?? defaultPrompt,
          },
        ],
      },
    ];

    messages[0].content.push(
      ...files?.map((file) => ({
        type: "image_url",
        image_url: {
          url: `data:${file?.type};base64,${file?.imgBase64}`,
        },
      }))
    );

    const payload = {
      model: "gpt-4-vision-preview",
      messages: messages,
      max_tokens: 300,
    };

    const result = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      { headers }
    );

    const data = await result.data.choices[0];
    return response(data, null, "Read image successfully");
  } catch (error) {
    return response(null, error, "Unable to read image!");
  }
}

module.exports = { convertImage };
