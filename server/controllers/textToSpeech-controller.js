const { getObjectId } = require("../libs/id");
const { getContentType, openAIClient } = require("../libs/common");
const { response } = require("../response");

async function textToSpeech(req, res) {
  try {
    const { text } = req.body;

    if (!text)
      return res.status(500).json(response(null, null, "text required!"));

    const openai = await openAIClient();

    const file_name = `${getObjectId()}.mp3`;
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "alloy",
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.status(200).json(
      response(
        {
          originalname: file_name,
          buffer: buffer,
          mimetype: getContentType(file_name),
        },
        null,
        "Text converted to Audio successfully",
        false
      )
    );
  } catch (error) {
    res
      .status(500)
      .json(response(null, error, "Unable to convert text to file"));
  }
}

module.exports = { textToSpeech };
