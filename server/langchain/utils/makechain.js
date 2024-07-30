require("dotenv").config();

const { ConversationalRetrievalQAChain } = require("langchain/chains");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { CallbackManager } = require("langchain/callbacks");
const { ChatAnthropicMessages } = require("@langchain/anthropic");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const CONDENSE_TEMPLATE = `As a language model, your task is to ask this question:
{question}`;

const getQATemplate = () => {
  return `  
   As an AI Data Extraction Helper, your task is to extract data, values from the provided document context.

Instructions:

Answer in pure JSON format without using 'json' syntax highlighting.
Include the following details in your JSON response for each bill (electricity and gas): Site Name, Meter Number, Account Number, Date, Invoice Number, Billing Period, Number of Days, Month, Year, Cost (GBP), Energy Consumption, Consumption Units, Energy Type, Service Provider.
If any data is missing from the bill, represent it with an empty string in the JSON response. Do not fill data if you are not sure about the result.
You will be provided with context and you must provide following values in return in all your responses:

Site Name: This is the company's or Clients Name.
Meter Number: This is the Meter Number stated as 'Meter' or 'Meter Number'. This is not the supply number.
Account Number: This is mentioned either as 'Your electricity account number:' or just 'Account Number'. 
Invoice Date: This is the Bill Date of the invoice/electricity bill, mentioned as 'bill date' or 'Dated' or may be some other form.
Invoice Number: This is the unique Invoice Number.
Billing Period: The range of dates the bill covers.
Number of Days: How many days the billing period covers.
Month: The month in which the invoice was issued.
Year: The year in which the invoice was issued.
Cost (GBP): The total cost in British Pounds.
Energy Consumption: The total energy consumption.
Consumption Units: The unit of measurement for energy consumption.
Energy Type: Type(s) of energy used.
Service Provider: The company providing the service.

----------
CONTEXT: {context}
----------
QUESTION: {question}
----------
Answer in pure json format:`;
};

const makeChain = (
  vectorstore,
  onTokenStream,
  key,
  model_type,
  chat_model,
  { prompt, temperature, language }
) => {
  const QA_TEMPLATE = getQATemplate(prompt, language);
  //===================== model ======================================

  let model;
  let nonStreamingModel;
  switch (model_type) {
    case "gemini-pro":
      model = new ChatGoogleGenerativeAI({
        modelName: chat_model || "gemini-pro",
        apiKey: key,
        temperature: temperature || 0.5,
      });
      break;
    case "openai":
      model = new ChatOpenAI({
        temperature: 0.2,
        openAIApiKey: key,
        modelName: "gpt-4o-2024-05-13",
        streaming: Boolean(onTokenStream),
        callbackManager: onTokenStream
          ? CallbackManager.fromHandlers({
              async handleLLMNewToken(token) {
                onTokenStream(token);
              },
            })
          : undefined,
      });

      nonStreamingModel = new ChatOpenAI({
        temperature: 0.1,
        modelName: "gpt-4o-2024-05-13",
        openAIApiKey: key,
      });
      break;
    case "anthropic":
      model = new ChatAnthropicMessages({
        temperature: temperature || 0.2,
        anthropicApiKey: key,
        modelName: chat_model || "claude-2.1",
        maxTokens: 1024,
        streaming: Boolean(onTokenStream),
        callbackManager: onTokenStream
          ? CallbackManager.fromHandlers({
              async handleLLMNewToken(token) {
                onTokenStream(token);
                console.log(token);
              },
            })
          : undefined,
      });
      break;
    default:
      break;
  }
  //=============================================================================

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_TEMPLATE,
      questionGeneratorTemplate: CONDENSE_TEMPLATE,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
      questionGeneratorChainOptions: nonStreamingModel
        ? {
            llm: nonStreamingModel,
          }
        : {},
    }
  );
  return chain;
};
module.exports = { makeChain };
