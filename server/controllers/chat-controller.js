const { response } = require("../response");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const { makeChain } = require("../langchain/utils/makechain");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const config = require("../global/config");
const { getApiKey, getModelType } = require("../libs/common");

async function chat(req, res) {
  try {
    const { /* question, */ history, file_id, streaming, ...rest } = req?.body;
    ////

    const question = `
Extract following values from the provided context:

{
Site Name: This is the company's or Clients Name.
Meter Number: This is the value of Meter Number mentioned as 'Meter:' or 'Meter Number' or something like this and this is not the supply number.
Account Number: This is mentioned either as 'Your electricity account number:' or just 'Account Number'. 
Invoice Date: This is the Bill Date of the invoice/electricity bill, mentioned as 'bill date' or 'Dated' or may be some other form.
Invoice Number: This is the unique Invoice Number.
Billing Period: The range of dates the bill covers.
Number of Days: Number of days that billing period covers. Calculate it by taking a difference between billing period. 
Month: The month in which the invoice was issued.
Year: The year in which the invoice was issued.
Cost (GBP): The total cost in British Pounds.
Energy Consumption: The total energy consumption.
Consumption Units: The unit of measurement for energy consumption.
Energy Type: Type(s) of energy used.
Service Provider: The company providing the service.
}`;

    let stream;
    if (streaming !== undefined && streaming !== null) {
      stream = streaming;
    } else {
      stream = true;
    }

    const pinecone_key = config.get("API_KEY_PINECONE");
    const pinecone_index = config.get("INDEX_NAME_PINECONE");
    const chat_model = "gpt-4"; //config.get("MODEL");
    const model_type = "openai"; //config.get("MODEL_TYPE") || getModelType(chat_model);
    const anthropic_key = config.get("ANTHROPIC_KEY");
    const key = getApiKey(model_type);

    if (stream) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
    }

    const sendData = (data) => {
      console.log(`data: [START]\n\n`);
      console.log(data);
      res.write(`data: ${data}\n\n`);
    };

    if (model_type == "anthropic" && !anthropic_key) {
      return sendErrorResponse({
        res,
        error: null,
        msg: "anthropic key required!",
        status: 400,
      });
    }

    if (!question || !file_id || !key || !pinecone_key || !pinecone_index) {
      return sendErrorResponse({
        res,
        error: null,
        msg: "incomplete credentials!",
        status: 400,
      });
    }

    const pinecone = new Pinecone({
      apiKey: pinecone_key,
    });

    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const index = pinecone.Index(pinecone_index);

    let embeddings;
    switch (model_type) {
      case "gemini-pro":
        embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: key,
          modelName: "embedding-001",
        });
        break;
      case "openai":
        embeddings = new OpenAIEmbeddings({
          openAIApiKey: key,
        });
        break;
      case "anthropic":
        embeddings = new OpenAIEmbeddings({
          openAIApiKey: key,
        });
        break;

      default:
        break;
    }

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
      namespace: file_id,
    });

    const getKey = (modelType, key, anthropicKey) => {
      return modelType === "anthropic" ? anthropicKey : key;
    };

    const chain = makeChain(
      vectorStore,
      stream
        ? (token) => {
            sendData(JSON.stringify({ data: token }));
          }
        : false,
      getKey(model_type, key, anthropic_key),
      model_type,
      chat_model,
      { ...rest }
    );
    try {
      const response = await chain.call({
        question: question,
        chat_history: "",
      });

      if (stream) {
        switch (model_type) {
          case "gemini-pro":
            sendData(JSON.stringify({ data: response?.text }));
            break;
          case "openai":
            sendData(JSON.stringify({ sourceDocs: response?.sourceDocuments }));
            break;
          case "anthropic":
            sendData(JSON.stringify({ data: response?.text }));
            break;
          default:
            sendData(JSON.stringify({ data: response?.text }));
            break;
        }
      } else {
        res.status(200).json({ data: JSON.parse(response?.text) });
      }
    } catch (error) {
      console.log({ error });
      sendErrorResponse({
        res,
        error,
        msg: "An error occurred while processing your request",
        status: 500,
      });
    } finally {
      if (stream && !res.finished) {
        res.write(`event: done\ndata: [DONE]\n\n`);
        res.end();
      }
    }
  } catch (error) {
    console.log({ error });
    return sendErrorResponse({
      res,
      error,
      msg: "UNABLE TO GET CHAT",
      status: 500,
    });
  }
}

const sendErrorResponse = async ({ res, error, msg, status = 500 }) => {
  const genericErrorResponse = response(null, error, msg);
  if (!res.headersSent) {
    res.status(status).json(genericErrorResponse);
  } else if (!res.finished) {
    res.write(`data: ${msg}\n\n`);
    res.write(`event: error\ndata: ${error}\n\n`);
    res.end();
  }
};

module.exports = {
  chat,
};
