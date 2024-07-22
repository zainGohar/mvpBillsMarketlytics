const { response } = require("../response");
const { createTextFile } = require("../libs/convertToFile");
const { deleteFiles } = require("../libs/deleteFile");
const { getObjectId } = require("../libs/id");
const { run } = require("./ingest");
const { saveFile } = require("../libs/saveFile");
const { removeExtension, folderPath, fileToText } = require("../libs/common");
const config = require("../global/config");
const { getFile } = require("../libs/getFile");
require("dotenv").config();

async function createFolder(req, res) {
  try {
    const folder_id = req?.body?.folder_id;
    const textContent = req?.body?.text_content;
    const files_to_add = req?.body?.files_to_add;
    const files_to_remove = req?.body?.files_to_remove;
    const storageType = config.get("STORAGE_TYPE");

    if ((textContent || files_to_remove) && !folder_id) {
      return res.status(400).json(response(null, null, "folder id Required!"));
    }

    if (folder_id && !config.get("URL_PINECONE")) {
      return res
        .status(400)
        .json(response(null, null, "Pinecone url id Required!"));
    }

    const objectFiles = [];
    const stringFiles = [];

    if (files_to_add?.length) {
      for (const element of files_to_add) {
        if (typeof element === "object" && element?.file_id && element?.file) {
          objectFiles.push(element);
        } else if (typeof element === "object" && !element?.file) {
          stringFiles.push(element?.file_id);
        } else {
          stringFiles.push(element);
        }
      }
    }

    let files = {};

    if (stringFiles) {
      const filesData = await getFile(stringFiles, storageType);
      files = filesData?.success;
    }
    let processedText = "";
    let file_names = "";

    if (files?.length) {
      processedText = processedText + (await processFiles(files));
      file_names = files?.map((f) => f?.originalname) + ",";
    }

    if (objectFiles?.length) {
      processedText = processedText + (await processFilesText(objectFiles));
      file_names = file_names + objectFiles?.map((f) => f?.file_id);
    }

    //=========================================================================================

    let concatResult = textContent;
    if (files_to_remove) {
      concatResult = await concatString(
        `${textContent}`,
        files_to_remove,
        folder_id,
        storageType
      );
    }

    await deleteFiles(folder_id, folderPath, storageType);

    const textForFile = concatResult + processedText;

    const fileName = removeExtension(folder_id) ?? getObjectId();
    const textToFile = await createTextFile(
      fileName,
      textForFile || "no data "
    );

    console.log({ textForFile });

    const runResult = await run(textToFile, "name");

    if (!runResult?.success) return res.status(500).json(runResult);

    const saveFileResult = await saveFile(
      runResult?.success?.name,
      textToFile,
      storageType
    );
    if (!saveFileResult?.success) return res.status(500).json(saveFileResult);

    return res.status(200).json(
      response(
        {
          file: runResult?.success,
          textContent: textForFile,
          file_names: file_names,
        },
        null,
        "ingestion complete"
      )
    );
  } catch (error) {
    console.log("error", error);
    return res.status(500).json(response(null, error, "SOMETHING WENTS WRONG"));
  }
}

async function concatString(inputString, file_ids, folder_id, storageType) {
  try {
    const file = await getFile(folder_id, storageType);
    const plainTextContent = file?.success[0]?.file?.buffer.toString("utf8");

    const folderString = `${plainTextContent} \n\n=========================\n\n ${inputString}`;
    const regex = new RegExp(
      `=============== file_id \\((${file_ids
        .map((id) => id)
        .join(
          "|"
        )})\\) ==================([\\s\\S]*?)============== end file_id \\(\\1\\) ==================\n\n`,
      "g"
    );

    const outputString = folderString?.replace(regex, "");
    return outputString;
  } catch (error) {
    throw error;
  }
}

async function processFiles(files) {
  let textContent = "";
  for (let i = 0; i < files.length; i++) {
    const file = files[i]?.file;
    const fileType = file?.mimetype;
    console.log({ fileType: fileType });
    textContent = await fileToText(file, fileType);
  }
  return textContent;
}

async function processFilesText(files) {
  let textContent = "";
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file?.file_id;
    const plainTextContent = file?.file;
    textContent += `=============== file_id (${fileName}) ==================`;
    textContent += plainTextContent;
    textContent += `============== end file_id (${fileName}) ==================\n\n`;
  }

  return textContent;
}

module.exports = { createFolder };
