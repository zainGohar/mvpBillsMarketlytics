const { response } = require("../response");
var AWS = require("aws-sdk");
const { folderPath, getContentType } = require("./common");
const config = require("../global/config");
const fs = require("fs");
const util = require("util");

async function getFileLocal(nameFile) {
  try {
    const retrivingData = Array.isArray(nameFile) ? nameFile : [nameFile];

    const files = [];
    const readdir = util.promisify(fs.readdir);
    const fileNames = await readdir(folderPath);
    const readFile = util.promisify(fs.readFile);
    for (const fileName of fileNames) {
      try {
        if (retrivingData?.includes(fileName)) {
          const filePath = `${folderPath}/${fileName}`;
          const fileContent = await readFile(filePath);
          console.log({ fileContent });
          files.push({
            file_id: fileName,
            path: filePath,
            storageType: "local",
            file: {
              originalname: fileName,
              buffer: fileContent,
              mimetype: getContentType(fileName),
            },
          });
        }
      } catch (error) {
        console.log({ error });
        console.log(`Error retrieving file ${fileName} from local`);
      }
    }
    return response(files, null, "File(s) retrieved from local storage.");
  } catch (err) {
    return response(null, err, "Error reading file from local storage.");
  }
}

async function getFileS3(nameFile) {
  try {
    const retrivingData = Array.isArray(nameFile) ? nameFile : [nameFile];

    const files = [];
    const correctData = retrivingData?.map((item) => item);

    AWS.config.update({
      accessKeyId: config.get("ACCESS_KEY_ID_AWS"),
      secretAccessKey: config.get("AWS_SERCRET_ID_AWS"),
    });
    const bucket = config.get("AWS_BUCKET_NAME_AWS");
    const s3 = new AWS.S3({ params: { Bucket: bucket } });
    const keys = correctData;

    const dir = config.get("AWS_DIRECTORY");

    const results = [];
    for (const key of keys) {
      try {
        const result = await s3
          .getObject({ Bucket: bucket, Key: `${dir ? dir + "/" + key : key}` })
          .promise();
        const keyComponents = key.split("/");
        const fileName = keyComponents[keyComponents.length - 1];
        results.push({ fileName, data: result });
      } catch (error) {
        console.log({ error });
        console.log(`Error retrieving file ${key} from AWS S3:`);
      }
    }
    const extractPromises = results.map(
      (result) =>
        new Promise((resolve, reject) => {
          if (result) {
            console.log({ result });
            files.push({
              file_id: result?.fileName,
              path: `s3://${bucket}/${result?.fileName}`,
              storageType: "aws",
              file: {
                originalname: result?.fileName,
                buffer: result?.data?.Body,
                mimetype: result?.data?.ContentType,
              },
            });
            resolve();
          } else {
            reject(console.log("Result is undefined"));
          }
        })
    );
    await Promise.all(extractPromises);
    return response(files, null, "File(s) retrieved from AWS storage.");
  } catch (err) {
    return response(null, err, "Error reading file from AWS.");
  }
}

async function getFile(file_id, storageType) {
  try {
    console.log({ file_id });
    let storage_type = storageType ?? config.get("STORAGE_TYPE");

    if (!file_id || !file_id?.length)
      return response(null, null, "file_id required!.");

    const files = [];

    if (!storage_type || storage_type === "aws") {
      const result = await getFileS3(file_id);
      if (!result?.success)
        return response(
          null,
          null,
          "Failed to get file from both AWS  storage."
        );
      files.push(...result?.success);
    }

    if (!storage_type || storage_type === "local") {
      const result = await getFileLocal(file_id);
      if (!result?.success)
        return response(
          null,
          null,
          "Failed to get file from both local storage."
        );
      files.push(...result?.success);
    }

    return response(files, null, "retrieved file(s) successfully.");
  } catch (err) {
    return response(null, err, "Error retrieving file.");
  }
}

module.exports = { getFile, getFileS3, getFileLocal };
