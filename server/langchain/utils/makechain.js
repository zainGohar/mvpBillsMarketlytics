require("dotenv").config();

const { ConversationalRetrievalQAChain } = require("langchain/chains");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { CallbackManager } = require("langchain/callbacks");
const { ChatAnthropicMessages } = require("@langchain/anthropic");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const CONDENSE_TEMPLATE = `As a language model, your task is to rephrase follow-up questions related to a
given conversation into standalone questions. If the follow-up question is not related to the conversation,
please leave it unchanged. Please provide clear and concise standalone questions that can be easily understood without requiring context from the original conversation.
Please note that your responses should demonstrate an understanding of natural language and be flexible enough to allow for various relevant and creative rephrasings.
 Follow Up Input: {question}
 Standalone question:`;

const getQATemplate = () => {
  return `  
   As an AI document helper, your task is to respond concisely to questions based on the provided document context.

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

----------
CONTEXT: {context}
----------
CHAT HISTORY: {chat_history}
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
        temperature: temperature || 0.1,
        openAIApiKey: key,
        modelName: chat_model || "gpt-3.5-turbo",
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
        modelName: chat_model,
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
