async function createTextFile(nameFile, textContent) {
  try {
    const fileName = nameFile + ".txt";
    const fileBuffer = Buffer.from(textContent, "utf8");

    const fileObject = {
      originalname: fileName,
      mimetype: "text/plain",
      size: fileBuffer.length,
      buffer: fileBuffer,
    };

    return fileObject;
  } catch (error) {
    throw error;
  }
}

module.exports = { createTextFile };
