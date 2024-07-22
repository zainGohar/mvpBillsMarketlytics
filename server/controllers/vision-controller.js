const { response } = require("../response");
const { getObjectId } = require("../libs/id");
const { openAIClient } = require("../libs/common");

const normalizeKey = (key) => {
  const keyMap = {
    "short description": "short_description",
    description: "description",
    keywords: "keywords",
    tags: "tags",
    "meta tags": "meta_tags",
    "meta title": "meta_title",
    "meta title (up to 60 characters)": "meta_title",
    "meta title (upto 60 characters)": "meta_title",
    "meta title (60 characters)": "meta_title",
    "meta description": "meta_description",
    "meta description (up to 160 characters)": "meta_description",
    "meta description (upto 160 characters)": "meta_description",
    "meta description (160 characters)": "meta_description",
  };

  // Replace multiple spaces or newline characters with a single space and trim
  key = key.replace(/\s+/g, " ").trim();
  return keyMap[key] || key;
};

function convertToObj(splice, apiResponse, prevResp, toChange) {
  const lines = apiResponse.split("\n\n");
  let obj = {
    short_description: prevResp?.["short_description"] ?? "",
    description: prevResp?.["description"] ?? "",
    tags: prevResp?.["tags"] ?? "",
    meta_tags: prevResp?.["meta_tags"] ?? "",
    meta_title: prevResp?.["meta_title"] ?? "",
    meta_description: prevResp?.["meta_description"] ?? "",
  };

  lines.forEach((line) => {
    if (line.includes(":")) {
      let [key, value] = line.split(splice);
      key = key.toLowerCase();
      key = normalizeKey(key);
      console.log({ key });
      if (obj.hasOwnProperty(key)) {
        if ((toChange && toChange === key) || !toChange) {
          obj[key] = value.trim();
        }
      }
    }
  });
  return obj;
}

async function generateProduct(req, res) {
  const openai = await openAIClient();

  const addTags = req.body?.["add_tags"];
  const avoidTags = req.body?.["avoid_tags"];
  const images = req.body?.["images"];
  const _id = req.body?.["_id"];

  const imageObjects = images.map((url) => ({
    type: "image_url",
    image_url: { url },
  }));

  try {
    const aIData = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `I want you to write me seo friendly descriptions of these given images for selling purpose. These may be the different images of the same product so provide only one detail.
          If the image contains multiple objects then write a description for largest prominent object. Also include keywords in descriptions. I need following formats in response.\n
          short description:\n
          description:\n
          Tags:\n
          meta tags:\n
          meta title {upto 60 characters}:\n
          meta description {upto 160 characters}:\n
          If you don't understand the image, then return empty string.\n
          Use this extra information taken from user to improve SEO information for this product: ${addTags}. \n Use this information as brand, category, color, etc whichever make more sense.
          Do not use these key words: ${avoidTags}\n
          Must return response, doesn't matter if picture depicts something other than mentioned in given tags.`,
            },
            ...imageObjects,
          ],
        },
      ],
      max_tokens: 4000,
    });

    const parsedObjects = convertToObj(
      ":\n",
      aIData.choices[0].message.content
    );

    console.log("Content", aIData.choices[0].message.content);
    console.log("parsedObjects", parsedObjects);
    console.log(aIData.choices[0]);
    console.log(aIData);

    const resultData = [
      {
        add_tags: addTags,
        avoid_tags: avoidTags,
        images,
        ...parsedObjects,
        product_id: getObjectId(),
        _id: _id,
      },
    ];

    res
      .status(200)
      .json(response(resultData, null, "Product Generated Successfuly"));
  } catch (error) {
    console.log("error", error);
  }
}

// ============================ regenerate ===========================

async function reGenerateProduct(req, res) {
  const openai = await openAIClient();

  const to_change = req.body?.["to_change"];
  const product_id = req.body?.["product_id"];

  const add_tags = req.body?.product?.["add_tags"];
  const avoid_tags = req.body?.product?.["avoid_tags"];
  const images = req.body?.product?.["images"];
  const short_description = req.body?.product?.["short_description"];
  const description = req.body?.product?.["description"];
  const tags = req.body?.product?.["tags"];
  const meta_tags = req.body?.product?.["meta_tags"];
  const meta_title = req.body?.product?.["meta_title"];
  const meta_description = req.body?.product?.["meta_description"];

  const imageObjects = images.map((url) => ({
    type: "image_url",
    image_url: { url },
  }));

  try {
    const content = `${short_description}\n +
  '\n' 
  'Description:\n' 
  ${description}\n +
  '\n' +
  'Tags:\n' 
  ${tags}\n +
  '\n' +
  'Meta tags:\n' 
  ${meta_tags}\n +
  '\n' 
  'Meta title (60 characters):\n' 
  ${meta_title}\n 
  '\n' 
  'Meta description (160 characters):\n ${meta_description}`;

    const aIData = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `This is the description and seo details about these images generated previously.\n
            ${content}\n
            I want you to regenerate the improved content based on the previos content and images. These may be the different images of the same product so provide only one detail.
            If the image contains multiple objects then write a description for largest prominent object. Also include keywords in descriptions. I need following formats in response.\n
            short description:\n
            description:\n
            Tags:\n
            meta tags:\n
            meta title {upto 60 characters}:\n
            meta description {upto 160 characters}:\n
            If you don't understand the image, then return empty string.\n
            Use this extra information taken from user to improve SEO information for this product: ${add_tags}. \n Use this information as brand, category, color, etc whichever make more sense.
            Do not use these key words: ${avoid_tags}\n
            Must return response, doesn't matter if picture depicts something other than mentioned in given tags.`,
            },
            ...imageObjects,
          ],
        },
      ],
      max_tokens: 4000,
    });
    const parsedObjects = await convertToObj(
      ":\n",
      aIData.choices[0].message.content,
      req.body?.product,
      to_change
    );

    const resultData = [
      {
        add_tags: add_tags,
        avoid_tags: avoid_tags,
        images,
        ...parsedObjects,
        product_id: product_id,
      },
    ];

    res
      .status(200)
      .json(response(resultData, null, "Product Generated Successfuly"));
  } catch (error) {
    console.log("Error", error);
  }
}

module.exports = {
  generateProduct,
  reGenerateProduct,
};
