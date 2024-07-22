const { createTextFile } = require("../libs/convertToFile");
const { response } = require("../response");
const fetch = require("node-fetch");
const { getObjectId } = require("../libs/id");
const { run } = require("./ingest");
const { saveFile } = require("../libs/saveFile");
const { audioToText } = require("../libs/audioToText");
const { removeSpecialCharacters } = require("../libs/removeSpecialCharacters");

const { streamToBuffer } = require("../libs/common");
const { PassThrough } = require("stream");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

async function convertYoutubeTofile(req, res) {
  let { url } = req.body;

  const YouTubeLinkResult = await fetchYouTubeLink(url);

  if (!YouTubeLinkResult?.success)
    return res.status(500).json(YouTubeLinkResult);

  const nameFile = getObjectId() + YouTubeLinkResult?.success?.nameFile;

  const file = await createTextFile(
    nameFile,
    YouTubeLinkResult?.success?.textContent
  );

  const runResult = await run(file);

  if (!runResult?.success) return res.status(500).json(runResult);

  const saveFileResult = await saveFile(runResult?.success?.name, file);
  if (!saveFileResult?.success) return res.status(500).json(saveFileResult);

  res.status(200).json(runResult);
}

async function insertYoutubeLink(req, res) {
  let { url } = req.body;

  const YouTubeLinkResult = await fetchYouTubeLink(url);

  if (!YouTubeLinkResult?.success) {
    return res.status(500).json(YouTubeLinkResult);
  } else {
    res.status(200).json(YouTubeLinkResult);
  }
}

async function fetchYouTubeLink(url) {
  try {
    const videoId = extractVideoId(url);
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails
    ,snippet&id=${videoId}&key=AIzaSyB8tyWO9e-pgLAp1kR2g2wAVSyAY_Zh9Jc`;
    const resp = await fetch(apiUrl);
    const data = await resp.json();
    if (data.items && data.items.length > 0) {
      const videoInfo = data?.items[0];
      const duration = videoInfo?.contentDetails?.duration ?? 0;
      const videoTitle = videoInfo?.snippet?.title ?? "";

      const videoLength = convertDurationToSec(duration);

      const nameFile = await removeSpecialCharacters(videoTitle);
      const getYoutubeResult = await getYoutubeData(url, nameFile, videoLength);
      return getYoutubeResult;
    } else {
      return response(null, data, "invalid youtube link!");
    }
  } catch (err) {
    return response(null, err, "invalid youtube link!");
  }
}

async function getYoutubeData(url, nameFile, videoLength) {
  try {
    const buffer = await getBufferFromLink(url);
    if (!buffer) return response(null, null, "Unreadable data!");

    const result = await audioToText({
      buffer,
    });
    if (!result.status) return result;
    let textContent = result?.text;

    return response(
      {
        nameFile,
        textContent,
        source_name: url,
        no_of_characters: textContent?.length,
        video_length: videoLength,
      },
      null,
      "convert to text successfully"
    );
  } catch (error) {
    console.log(error);
    return response(null, error, "Error processing YouTube data");
  }
}

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const getBufferFromLink = async (videoUrl) => {
  try {
    const videoStream = ytdl(videoUrl, { quality: "highestaudio" });
    const audioStream = new PassThrough();
    ffmpeg(videoStream)
      .format("ogg")
      .noVideo()
      .outputOptions("-map_metadata -1")
      .audioChannels(1)
      .audioCodec("libopus")
      .audioBitrate("12k")
      .outputOption("-application voip")
      .on("error", (error) => console.log("error in ffmpeg", error))
      .pipe(audioStream);

    return await streamToBuffer(audioStream);
  } catch (error) {
    console.log("An error occurred:", error);
    return null;
  }
};

function extractVideoId(url) {
  let videoId = null;
  const watchPattern = /(?:\?v=)([^&]+)/;
  const watchMatch = url.match(watchPattern);
  if (watchMatch && watchMatch[1]) {
    videoId = watchMatch[1];
  } else {
    const bePattern = /youtu\.be\/([^?\s]+)/;
    const beMatch = url.match(bePattern);
    if (beMatch && beMatch[1]) {
      videoId = beMatch[1];
    } else {
      const shortsPattern = /(?:\/shorts\/)([^?\s]+)/;
      const shortsMatch = url.match(shortsPattern);
      if (shortsMatch && shortsMatch[1]) {
        videoId = shortsMatch[1];
      }
    }
  }

  return videoId;
}

function convertDurationToSec(duration) {
  const matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(matches[1]) || 0;
  const minutes = parseInt(matches[2]) || 0;
  const seconds = parseInt(matches[3]) || 0;
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}

module.exports = {
  insertYoutubeLink,
  fetchYouTubeLink,
  convertYoutubeTofile,
};
