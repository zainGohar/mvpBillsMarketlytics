const { createTextFile } = require("../libs/convertToFile");
const { response } = require("../response");
const { getObjectId } = require("../libs/id");
const { run } = require("./ingest");
const { saveFile } = require("../libs/saveFile");
const { removeSpecialCharacters } = require("../libs/removeSpecialCharacters");
const {
  CheerioWebBaseLoader,
} = require("langchain/document_loaders/web/cheerio");
const { makeValidLink } = require("../libs/common");

async function convertURLToFile(req, res) {
  let { url } = req.body;

  const valid = makeValidLink(url);

  const WebLinkResult = await convertURLToTxt(valid);

  if (!WebLinkResult?.success) return res.status(500).json(WebLinkResult);

  const nameFile = getObjectId() + WebLinkResult?.success?.nameFile;

  const file = await createTextFile(
    nameFile,
    WebLinkResult?.success?.textContent
  );
  const runResult = await run(file);

  if (!runResult?.success) return res.status(500).json(runResult);

  const saveFileResult = await saveFile(runResult?.success?.name, file);

  if (!saveFileResult?.success) return res.status(500).json(saveFileResult);

  res.status(200).json(runResult);
}

async function insertWebLink(req, res) {
  let { url } = req.body;
  const WebLinkResult = await convertURLToTxt(url);
  if (!WebLinkResult?.success) {
    return res.status(500).json(WebLinkResult);
  } else if (WebLinkResult?.success?.textContent?.error) {
    const WebLinkerror = WebLinkResult?.success?.textContent?.error;
    if (WebLinkerror)
      return res
        .status(500)
        .json(response(null, WebLinkerror, "unable to convert url"));
  } else {
    return res.status(200).json(WebLinkResult);
  }
}

async function convertURLToTxt(url) {
  try {
    const validUrls = [url];
    const loaders = validUrls?.map((url) => {
      return new CheerioWebBaseLoader(url, {
        selector: "p, h1, h2, h3, h4, h5, h6, article, table",
      });
    });

    const docsPromises = loaders?.map((loader) => loader.load());
    const docsArray = await Promise.allSettled(docsPromises);

    // Flattening and restructuring the documents
    const combinedDocs = docsArray.flatMap((result, index) => {
      if (result.status === "fulfilled") {
        return result.value.map((doc) => {
          return doc.pageContent;
        });
      } else {
        console.error(
          `Failed to load URL ${validUrls[index]}: ${result.reason}`
        );
        return [];
      }
    });

    let result = "";

    for (let i = 0; i < combinedDocs?.length; i++) {
      let pageContent = combinedDocs[i]; // extract page_content

      `\n\n-------------------- (${url}) --------------------\n\n
    ${pageContent}
    \n${"-".repeat(50)}\n\n`;

      result += `${pageContent}\n${"=".repeat(50)}\n\n`; // append to result string
    }

    return response(
      {
        textContent: result,
        nameFile: await removeSpecialCharacters(url),
        no_of_characters: result?.length,
      },
      null,
      "convert to text successfully"
    );
  } catch (error) {
    console.log(error);
    return response(null, error, "unable to convert url");
  }
}

module.exports = {
  convertURLToTxt,
  insertWebLink,
  convertURLToFile,
};
