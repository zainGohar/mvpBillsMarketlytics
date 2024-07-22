const fs = require("fs");
const { createTempFile, unlinkAsync, openAIClient } = require("./common");
const { response } = require("../response");

async function audioToText({ buffer }) {
  const size = buffer?.length / (1024 * 1024);
  if (size > 25) {
    return response(null, null, `Size exceeded. Max size allowed 25MB`);
  }
  const tempFilename = await createTempFile(
    `temp-audio-${Date.now()}.mp3`,
    buffer
  );
  try {
    const openai = await openAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilename),
      model: "whisper-1",
    });
    return { status: true, text: transcription.text };
  } catch (error) {
    return { status: false, error: error?.error };
  } finally {
    await unlinkAsync(tempFilename);
  }
}

module.exports = { audioToText };
