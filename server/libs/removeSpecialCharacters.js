async function removeSpecialCharacters(inputString) {
  try {
    const pdfContent = await inputString;
    const regex = /[^a-zA-Z0-9.]/g;
    const cleanedString = pdfContent.replace(regex, "");
    return cleanedString;
  } catch (error) {
    return null;
  }
}

module.exports = { removeSpecialCharacters };
