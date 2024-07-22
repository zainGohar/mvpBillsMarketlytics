const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: "../.env.local" });
}

let config = {
  PORT: process.env.PORT,
  API_KEY_PINECONE: process.env.API_KEY_PINECONE,
  ENVIRONMENT_PINECONE: process.env.ENVIRONMENT_PINECONE,
  INDEX_NAME_PINECONE: process.env.INDEX_NAME_PINECONE,
  ACCESS_KEY_ID_AWS: process.env.ACCESS_KEY_ID_AWS,
  AWS_SERCRET_ID_AWS: process.env.AWS_SERCRET_ID_AWS,
  AWS_BUCKET_NAME_AWS: process.env.AWS_BUCKET_NAME_AWS,
  AWS_REGION_AWS: process.env.AWS_REGION_AWS,
  URL_PINECONE: process.env.URL_PINECONE,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASS: process.env.DB_PASS,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  OPENAI_KEY: process.env.OPENAI_KEY,
  GEMINI_KEY: process.env.GEMINI_KEY,
  ANTHROPIC_KEY: process.env.ANTHROPIC_KEY,
  URL_PINECONE: process.env.URL_PINECONE,
  STORAGE_TYPE: process.env.STORAGE_TYPE,
  MODEL: process.env.MODEL,
  MODEL_TYPE: process.env.MODEL_TYPE,
  OUTPUT: process.env.OUTPUT,
};

module.exports = {
  get: function (key) {
    return config[key];
  },
  set: function (newConfig) {
    config = { ...config, ...newConfig };
  },
};
