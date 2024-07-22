const fs = require("fs");
const util = require("util");
const { response } = require("../response");
const { DeleteObjectsCommand, S3Client } = require("@aws-sdk/client-s3");
const config = require("../global/config");

async function deleteFromPinecone(file_name) {
  try {
    const pinecone_key = config.get("API_KEY_PINECONE");
    const pinecone_url = config.get("URL_PINECONE");

    const apiUrl = `${pinecone_url}/vectors/delete?deleteAll=true&namespace=${file_name}`;
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Api-Key": pinecone_key,
      },
    });
    const data = await resp.json();

    return data;
  } catch (err) {
    return null;
  }
}

async function deleteFileLocal(file_name, folderPath) {
  const unlink = util.promisify(fs.unlink);
  const resultArray = file_name?.split(",");
  for (const file of resultArray) {
    const filePath = `${folderPath}/${file}`;
    await unlink(filePath);
  }
}

async function deleteFileS3(correctData) {
  try {
    const stringArray = correctData?.split(",");
    const resultArray = stringArray.map((key) => ({ Key: key.trim() }));

    const client = new S3Client({
      region: config.get("AWS_REGION_AWS"),
      credentials: {
        accessKeyId: config.get("ACCESS_KEY_ID_AWS"),
        secretAccessKey: config.get("AWS_SERCRET_ID_AWS"),
      },
    });

    const command = new DeleteObjectsCommand({
      Bucket: config.get("AWS_BUCKET_NAME_AWS"),
      Delete: {
        Objects: resultArray,
      },
    });
    const { Deleted } = await client.send(command);
    return response(Deleted, null, `Successfully deleted ${Deleted.length}`);
  } catch (err) {
    return response(null, err, `Unable to delete files from s3`);
  }
}

async function deleteFiles(file_name, folderPath, storageType) {
  try {
    let storage_type = storageType ?? config.get("STORAGE_TYPE");

    await deleteFromPinecone(file_name);

    if (storage_type === "aws") {
      const Deleted = await deleteFileS3(file_name);
      return Deleted;
    } else if (storage_type === "local") {
      await deleteFileLocal(file_name, folderPath);
      return response(true, null, `Successfully deleted local files`);
    } else {
      const Deleted = await deleteFileS3(file_name);

      if (!Deleted?.success || Deleted?.success?.length === 0) {
        await deleteFileLocal(file_name, folderPath);
        return response(
          true,
          null,
          `No files deleted in S3, so deleted local files`
        );
      } else {
        return Deleted;
      }
    }
  } catch (err) {
    return response(null, err, `No file found to delete`);
  }
}

module.exports = {
  deleteFromPinecone,
  deleteFiles,
  deleteFileS3,
  deleteFileLocal,
};
