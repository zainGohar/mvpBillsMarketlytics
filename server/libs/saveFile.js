const fs = require("fs");
const path = require("path");
const { response } = require("../response");
var AWS = require("aws-sdk");
const config = require("../global/config");

async function saveLocalFile(nameFile, file) {
  try {
    const localFilePath = path.join(__dirname, "..", "/local-files", nameFile);

    return new Promise((resolve, reject) => {
      fs.writeFile(localFilePath, file.buffer, (err) => {
        if (err) {
          reject(response(null, err, "Error saving file locally."));
        }
        resolve(
          response(
            { file_id: nameFile, path: localFilePath, storageType: "local" },
            null,
            "File uploaded and saved locally."
          )
        );
      });
    });
  } catch (err) {
    return response(null, err, "Error saving file locally.");
  }
}

async function saveFileS3(nameFile, file) {
  try {
    const dir = config.get("AWS_DIRECTORY");
    const params = {
      Bucket: config.get("AWS_BUCKET_NAME_AWS"),
      Key: `${dir ? dir + "/" + nameFile : nameFile}`,
      Body: file.buffer,
      ContentType: file?.mimetype,
      ACL: "public-read",
    };
    const s3 = new AWS.S3({
      accessKeyId: config.get("ACCESS_KEY_ID_AWS"),
      secretAccessKey: config.get("AWS_SERCRET_ID_AWS"),
    });

    const result = await s3.upload(params).promise();
    return response(
      {
        file_id: nameFile,
        path: result?.Location,
        storageType: "aws",
        ...result,
      },
      null,
      "File uploaded and saved to AWS."
    );
  } catch (err) {
    return response(null, err, "Error saving file to AWS.");
  }
}

async function saveFile(file_id, textToFile, storageType) {
  try {
    let storage_type = storageType ?? config.get("STORAGE_TYPE");
    if (!storage_type) {
      saveAWSResult = await saveFileS3(file_id, textToFile);

      if (!saveAWSResult?.success) {
        saveLocalResult = await saveLocalFile(file_id, textToFile);
        if (!saveLocalResult?.success) {
          return response(
            null,
            null,
            "Failed to save to both AWS and local storage."
          );
        } else {
          return saveLocalResult;
        }
      } else {
        return saveAWSResult;
      }
    } else if (storage_type === "aws") {
      saveAWSResult = await saveFileS3(file_id, textToFile);
      return saveAWSResult;
    } else if (storage_type === "local") {
      saveLocalResult = await saveLocalFile(file_id, textToFile);
      return saveLocalResult;
    } else {
      return response(
        null,
        null,
        "Failed to save to both AWS and local storage."
      );
    }
  } catch (err) {
    return response(null, err, "Error saving file locally.");
  }
}

module.exports = { saveFile, saveFileS3, saveLocalFile };
