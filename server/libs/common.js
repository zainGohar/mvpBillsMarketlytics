const path = require("path");
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const mime = require("mime-types");
const OpenAI = require("openai");

//===============================
const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const csv = require("csv-parser");
const streamifier = require("streamifier");
const mammoth = require("mammoth");
const config = require("../global/config");
//===============================

const removeExtension = (filename) => {
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  return basename;
};

function processFileExtension(filename) {
  const extension = path.extname(filename) ?? "";
  if (extension === ".epub") {
    return `${filename}+zip`;
  } else if (extension === ".docx") {
    const name = removeExtension(filename);
    filename =
      name + ".vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return filename;
}

function makeValidLink(url) {
  const pattern = /^https?:\/\//;
  if (!pattern.test(url)) {
    // If the URL doesn't start with http:// or https://, prepend https:// to it
    return "https://" + url;
  }
  return url;
}

async function streamToBuffer(inputStream) {
  const streamBuffer = promisify(require("stream-to-buffer"));
  try {
    return await streamBuffer(inputStream);
  } catch (error) {
    console.log("An error occurred:", error);
    return null;
  }
}

const writeFileAsync = promisify(fs.writeFile); // to create temp file
const unlinkAsync = promisify(fs.unlink); // to remove temp file

async function createTempFile(fileName, buffer) {
  const tempFilename = path.join(os.tmpdir(), fileName);
  await writeFileAsync(tempFilename, buffer);
  return tempFilename;
}

function convertStringToBoolean(string) {
  if (string == "true") {
    return true;
  } else if (string == "false") {
    return false;
  } else {
    return null;
  }
}

const folderPath = "./local-files";

function getContentType(fileName) {
  const mime_type = mime.lookup(fileName);
  return mime_type;
}

async function openAIClient(apiKey) {
  return new OpenAI({
    apiKey: apiKey ?? config.get("OPENAI_KEY"),
  });
}

async function fileToText(file) {
  let textContent = "";
  let fileType = file?.mimetype ?? getContentType(file?.originalname);
  const fileName = file?.originalname;
  if (fileType === "application/pdf") {
    try {
      const data = await pdfExtract?.extractBuffer(file.buffer);
      const pages = data?.pages;
      textContent += `=============== file_id (${fileName}) ==================`;
      pages.forEach((page) => {
        page.content.forEach((textItem) => {
          textContent += textItem?.str + " ";
        });
      });
      textContent += `============== end file_id (${fileName}) ==================\n\n`;
    } catch (err) {
      return err;
    }
  } else if (fileType === "text/plain") {
    const plainTextContent = file.buffer.toString("utf8");
    textContent += `=============== file_id (${fileName}) ==================`;
    textContent += plainTextContent;
    textContent += `============== end file_id (${fileName}) ==================\n\n`;
  } else if (fileType === "text/csv") {
    const csvData = await new Promise((resolve, reject) => {
      let csvText = "";
      streamifier
        .createReadStream(file.buffer)
        .pipe(csv())
        .on("data", (row) => {
          Object.values(row).forEach((value) => {
            csvText += value + " ";
          });
        })
        .on("end", () => resolve(csvText))
        .on("error", reject);
    });
    textContent += `=============== file_id (${fileName}) ==================`;
    textContent += csvData;
    textContent += `============== end file_id (${fileName}) ==================\n\n`;
  } else if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const data = await mammoth.extractRawText({ buffer: file.buffer });
      textContent += `=============== file_id (${fileName}) ==================`;
      textContent += data?.value + " ";
      textContent += `============== end file_id (${fileName}) ==================\n\n`;
    } catch (err) {
      return err;
    }
  } else {
    return null;
  }
  return textContent;
}

const getApiKey = (modelType) => {
  const keys = {
    "gemini-pro": config.get("GEMINI_KEY"),
    openai: config.get("OPENAI_KEY"),
    anthropic: config.get("OPENAI_KEY"), // to ingest data source
  };

  return keys[modelType];
};

const llm_models = [
  {
    name: "GPT-3.5-Turbo",
    value: "gpt-3.5-turbo",
    type: "open-ai",
    id: 0,
  },
  {
    name: "GPT-4",
    value: "gpt-4",
    type: "open-ai",
    id: 1,
  },
  {
    img: "gpt-4",
    name: "GPT-4 Tubro",
    value: "gpt-4-1106-preview",
    type: "open-ai",
    id: 5,
  },
  {
    img: "claude",
    name: "Claude 2.1",
    value: "claude-2.1",
    type: "anthropic",
    id: 2,
  },
  {
    img: "gemini",
    name: "Google Gemini Pro",
    value: "gemini-pro",
    type: "gemini-pro",
    id: 3,
  },
];

function getModelType(model) {
  const matchingModel = llm_models.find((m) => m.value === model);
  return matchingModel ? matchingModel.type : "openai";
}

module.exports = {
  processFileExtension,
  removeExtension,
  makeValidLink,
  streamToBuffer,
  createTempFile,
  unlinkAsync,
  convertStringToBoolean,
  folderPath,
  getContentType,
  openAIClient,
  fileToText,
  getApiKey,
  llm_models,
  getModelType,
};
