const config = require("../global/config");

const headerEnvMap = {
  "pinecone-key": "API_KEY_PINECONE",
  "pinecone-environment": "ENVIRONMENT_PINECONE",
  "pinecone-index": "INDEX_NAME_PINECONE",
  "aws-region": "AWS_REGION_AWS",
  "aws-access-key": "ACCESS_KEY_ID_AWS",
  "aws-secret-key": "AWS_SECRET_ID_AWS",
  "aws-bucket-name": "AWS_BUCKET_NAME_AWS",
  "aws-directory": "AWS_DIRECTORY",
  "pinecone-url": "URL_PINECONE",
  "storage-type": "STORAGE_TYPE",
  model: "MODEL",
  "model-type": "MODEL_TYPE",
  output: "OUTPUT",
  "openai-key": "OPENAI_KEY",
  "gemini-key": "GEMINI_KEY",
  "anthropic-key": "ANTHROPIC_KEY",
};

module.exports = function (req, res, next) {
  const newConfig = {};

  for (const header in headerEnvMap) {
    newConfig[headerEnvMap[header]] =
      req.headers[header] ??
      req.query[header] ??
      process.env[headerEnvMap[header]];
  }

  config.set(newConfig);

  next();
};
