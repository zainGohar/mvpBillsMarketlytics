const { TextLoader } = require("langchain/document_loaders/fs/text");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const { Pinecone } = require("@pinecone-database/pinecone");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { CustomPDFLoader } = require("../langchain/utils/customPDFLoader");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const path = require("path");
const { response } = require("../response");
const config = require("../global/config");
const { fileToText, getApiKey } = require("../libs/common");

const run = async (uploadedFile, returnValue, key) => {
  try {
    const pinecone_key = config.get("API_KEY_PINECONE");
    const pinecone_environment = config.get("ENVIRONMENT_PINECONE");
    const pinecone_index = config.get("INDEX_NAME_PINECONE");
    const model_type = config.get("MODEL_TYPE") || "openai";
    const KEY = key || getApiKey(model_type);
    const output = returnValue || config.get("OUTPUT");

    if (!pinecone_environment || !pinecone_key || !pinecone_index || !KEY)
      return response(null, null, "incomplete credentials!");

    const pinecone = new Pinecone({
      apiKey: pinecone_key,
    });

    const fileResponse = await uploadedFile?.buffer;
    const extension = path.extname(uploadedFile?.originalname);

    const loaders = {
      ".docx": {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        Loader: DocxLoader,
      },
      ".csv": { type: "text/csv", Loader: CSVLoader },
      ".txt": { type: "text/plain", Loader: TextLoader },
      ".plain": { type: "text/plain", Loader: TextLoader },
      ".pdf": { type: "application/pdf", Loader: CustomPDFLoader },
    };

    let rawDocs;
    if (loaders[extension]) {
      const { type, Loader } = loaders[extension];
      const blob = new Blob([fileResponse], { type });
      const loader = new Loader(blob);
      rawDocs = await loader.load();
    }

    let chunkSize;
    switch (model_type) {
      case "gemini-pro":
        chunkSize = 5000;
        break;
      case "openai":
        chunkSize = 1000;
        break;
      case "anthropic":
        chunkSize = 1000;
        break;
      default:
        break;
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.splitDocuments(rawDocs ?? []);

    console.log("creating vector store...", uploadedFile?.originalname);

    //================== Enbedding =========================
    let embeddings;
    switch (model_type) {
      case "gemini-pro":
        embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: KEY,
          modelName: "embedding-001",
        });
        break;
      case "openai":
        embeddings = new OpenAIEmbeddings({
          openAIApiKey: KEY,
        });
        break;
      case "anthropic":
        embeddings = new OpenAIEmbeddings({
          openAIApiKey: KEY,
        });
        break;

      default:
        break;
    }

    const index = pinecone.Index(pinecone_index);

    if (model_type == "gemini-pro") {
      for (let i = 0; i < docs.length; i++) {
        await PineconeStore.fromDocuments([docs[i]], embeddings, {
          pineconeIndex: index,
          namespace: uploadedFile?.originalname,
          textKey: "text",
        });
      }
    } else {
      await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        namespace: uploadedFile?.originalname,
        textKey: "text",
      });
    }

    console.log("ingestion complete", uploadedFile?.originalname);

    const responseObj = {
      name: uploadedFile?.originalname ?? "",
      file: (await fileToText(uploadedFile)) ?? "",
    };
    if (output && (output === "name" || output === "file")) {
      return response(
        {
          [output]: responseObj[output],
        },
        null,
        "ingestion complete"
      );
    } else {
      return response(responseObj, null, "ingestion complete");
    }
  } catch (error) {
    console.log("error", error);
    return response(null, error, "Failed to ingest your data");
  }
};

module.exports = {
  run,
};
