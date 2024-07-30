const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage } = require("@langchain/core/messages");
const multer = require("multer");
const pdf = require("pdf-parse");
const fs = require("fs/promises");
const { deleteFiles } = require("../libs/deleteFile");
const { response } = require("../response");
const { jsonrepair } = require("jsonrepair");
const config = require("../global/config");
const { saveFile } = require("../libs/saveFile");
const upload = multer({ storage: multer.memoryStorage() });

async function analyze(req, res) {
  const model = new ChatOpenAI({
    model: "gpt-4-1106-preview",
    // model: "gpt-4o-2024-05-13",
    // model: "gpt-4o",
    apiKey: config.get("OPENAI_KEY"),
    response_format: { type: "json_object" },
  });

  console.log("rech thre");
  upload.any("files")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return sendErrorResponse(res, "File upload error.");
    } else if (err) {
      return sendErrorResponse(res, err);
    }

    const storageType = "local";
    const { files } = req;
    if (!files?.length) {
      return sendErrorResponse(res, "No file uploaded.");
    }

    const pdfObjects = [];
    const file_ids = [];

    for (let i = 0; i < files?.length; i++) {
      const file = files[i];
      if (file.mimetype !== "application/pdf") {
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
      if (!saveFileResult?.success) {
        if (file_ids?.length) {
          for (let i = 0; i < file_ids?.length; i++) {
            await deleteFiles(file_ids[i], folderPath, storageType);
          }
        }
        return sendErrorResponse(res, saveFileResult.message.content);
      }
      file_ids.push(saveFileResult?.success?.file_id);
      const dataBuffer = await fs.readFile(saveFileResult?.success?.path);
      const data = await pdf(dataBuffer);
      pdfObjects.push(data.text);
    }

    console.log("================= reached to PROMPT =============");

    try {
      const messages = [
        new HumanMessage(`
    Here is the content of the PDF(s): ${pdfObjects.join("\n")}. 
    
    Answer the following question: Analyze this utility bill. 
    
    Respond in pure JSON format without wrapping it in '\\\`\\\`\\\`json\n'. Do not add any comments in the JSON.
    
    If any of these fields are not mentioned in the content of the PDF(s), leave them as an empty string. Do not add any extra brackets. 
    
    Instructions:

    If a question relates to the context provided, respond suitably using paragraphs, bullet points, tables, or a conversational style.
    Use proper alignment and indentation to make the response clear and well-structured.
    Include only relevant hyperlinks from the document.
    Answer in pure JSON format without using 'json' syntax highlighting.
    Include the following details in your JSON response for each bill (electricity and gas): Site Name, Meter Number, Account Number, Invoice Date, Invoice Number, Billing Period, Number of Days, Month, Year, Cost (GBP), Energy Consumption, Consumption Units, Energy Type, Service Provider.
    If any data is missing from the bill, represent it with an empty string in the JSON response.
    Follow these instructions below in all your responses:

    Site Name: The company's name.
    Meter Number: Provide the meter number.
    Account Number: Provide the account number.
    Invoice Date: The date the invoice was issued.
    Invoice Number: The unique identifier for the invoice.
    Billing Period: The range of dates the bill covers.
    Number of Days: How many days the billing period covers.
    Month: The month in which the invoice was issued.
    Year: The year in which the invoice was issued.
    Cost (GBP): The total cost in British Pounds.
    Energy Consumption: The total energy consumption.
    Consumption Units: The unit of measurement for energy consumption.
    Energy Type: Type(s) of energy used.
    Service Provider: The company providing the service.

    Example response format:

    {
        "Site Name": "",
        "Meter Number": "",
        "Account Number": "",
        "Invoice Date": "",
        "Invoice Number": "",
        "Billing Period": "",
        "Number of Days": "",
        "Month": "",
        "Year": "",
        "Cost (GBP)": "",
        "Energy Consumption": "",
        "Consumption Units": "",
        "Energy Type": "",
        "Service Provider": ""
    }
  `),
      ];

      console.log("================= reached to GPT =============");

      const resp = await model.invoke(messages);

      console.log("================= reached to RESULT =============");

      const result = resp?.lc_kwargs?.content;

      console.log("================= reached to REPAIR =============", result);

      const repaired = jsonrepair(result);

      console.log(
        "================= reached to PARSER =============",
        repaired
      );

      const jsonData = JSON.parse(repaired);
      res.status(200).json(
        response(
          {
            name: file_ids[0],
            file: JSON.stringify(jsonData),
          },
          null,
          "success"
        )
      );
    } catch (error) {
      console.log({ error });
      return sendErrorResponse(res, error);
    }
  });
}

const sendErrorResponse = async (res, error) => {
  const errorMessage = typeof error === "string" ? error : "";
  const err = JSON.stringify({ error: { message: error } });
  res.status(500).json(response(null, err, errorMessage));
};

module.exports = { analyze };
