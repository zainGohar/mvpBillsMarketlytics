const { createTextFile } = require("../libs/convertToFile");
const { response } = require("../response");
const { getObjectId } = require("../libs/id");
const { run } = require("./ingest");
const fs = require("fs");
const path = require("path");
const { saveFile } = require("../libs/saveFile");
const { removeSpecialCharacters } = require("../libs/removeSpecialCharacters");

async function convertTextToFile(req, res) {
  try {
    let { name, text_content } = req.body;

    const nameFile = getObjectId() + (await removeSpecialCharacters(name));

    const file = await createTextFile(nameFile, text_content);
    const runResult = await run(file);

    if (!runResult?.success) return res.status(500).json(runResult);

    const saveFileResult = await saveFile(runResult?.success?.name, file);

    if (!saveFileResult?.success) return res.status(500).json(saveFileResult);

    res.status(200).json(runResult);
  } catch (err) {
    return res.status(500).json(response(null, err, "unable to create file"));
  }
}

async function insertText(req, res) {
  try {
    let { name, text_content } = req.body;
    console.log("name, textContent ", name, text_content);
    const TextResult = await createTextFile(name, text_content);

    return res
      .status(200)
      .json(response(TextResult, null, "file created successfully"));
  } catch (err) {
    return res.status(500).json(response(null, err, "unable to create file"));
  }
}

module.exports = {
  insertText,
  convertTextToFile,
};
