const multer = require("multer");
const config = require("../global/config");
const { response } = require("../response");
var AWS = require("aws-sdk");
const { fileToText } = require("../libs/common");

async function analyseEntities(req, res) {
  const { text } = req?.body;

  AWS.config.update({
    accessKeyId: config.get("ACCESS_KEY_ID_AWS"),
    secretAccessKey: config.get("AWS_SERCRET_ID_AWS"),
    region: config.get("AWS_REGION_AWS"),
  });

  const params = {
    LanguageCode: "en",
    Text: text,
  };

  const comprehend = new AWS.Comprehend();
  comprehend.detectEntities(params, function (error, data) {
    if (error) res.status(500).json(error);
    else res.status(200).json(data);
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
});

async function analyseDocument(req, res) {
  upload.single("file")(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json(response(null, err, "File upload error."));
      } else if (err) {
        return res
          .status(500)
          .json(response(null, err, "Internal server error."));
      }
      if (!req.file) {
        return res.status(400).json(response(null, err, "No file uploaded."));
      }

      const uploadedFile = req.file;

      const plainText = await fileToText(uploadedFile);

      AWS.config.update({
        accessKeyId: config.get("ACCESS_KEY_ID_AWS"),
        secretAccessKey: config.get("AWS_SERCRET_ID_AWS"),
        region: config.get("AWS_REGION_AWS"),
      });

      const comprehend = new AWS.Comprehend();

      const params = {
        LanguageCode: "en",
        Text: plainText,
      };

      comprehend.detectEntities(params, function (error, data) {
        if (error) res.status(500).json(error);
        else res.status(200).json(data);
      });
    } catch (error) {
      console.log({ error });
    }
  });
}

module.exports = { analyseEntities, analyseDocument };
