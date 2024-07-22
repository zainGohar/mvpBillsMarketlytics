import React from "react";
import {
  getUserFiles,
  setFile,
  setProgressType,
  uploadToServer,
} from "@/store/aiFileStructure";
import { useDispatch, useSelector } from "react-redux";
import { handleUniqueName } from "@/libs/common";
import { setLoader } from "@/store/loader";
import PercentageLoading from "@/libs/percentageLoader";
import Button from "@/libs/button/page";

const AudioButton = () => {
  const dispatch = useDispatch();

  const files = useSelector((state) => getUserFiles(state));

  const StoreLoader = useSelector((state) => state.entities.loader);
  const acceptFiles = "audio/mpeg,audio/wav,audio/ogg,audio/mp4";

  async function handleUpload(event) {
    const i = event?.target?.files[0];
    let name = await handleUniqueName(files, i?.name);
    dispatch(setFile(i));
    await dispatch(setProgressType("file"));
    await dispatch(setLoader("uploadAudio"));
    const formData = new FormData();
    formData.append("file", i);
    await dispatch(
      uploadToServer({
        data: formData,
        name,
        url: `/audio`,
        type: "audio",
      })
    );
  }

  return (
    <>
      <div className="mb-2">
        <div className="position-relative">
          <input
            type="file"
            className="position-absolute w-100 h-100 cursor-pointer"
            style={{
              zIndex: "999",
              opacity: "0%",
              pointerEvents:
                StoreLoader && StoreLoader["uploadAudio"] ? "none" : "auto",
            }}
            onChange={handleUpload}
            accept={acceptFiles}
          />
          <Button
            text={
              <div className="d-flex flex-column align-items-center justify-content-center mb-3 px-2 px-sm-5">
                <span className="font-box fw-semibold d-sm-block d-none mb-1">
                  Drag and Drop audio here or click to select audio
                </span>
                <span className="font-box fw-semibold d-sm-none d-block mb-1">
                  Click to select audio
                </span>
                <span className="font-box  d-sm-block d-none">
                  Supported formats type .mp3, .wav, .ogg, .m4a
                </span>
                <span className="font-box  d-sm-none d-block">
                  .mp3, .wav, .ogg, .m4a
                </span>
              </div>
            }
            id="uploadAudio"
            className="upload_box"
            BIcon="bi bi-upload font-bold fs-5"
            loading={StoreLoader && StoreLoader["uploadAudio"] ? true : false}
            LoaderPosition="end"
          />
        </div>
        {StoreLoader && StoreLoader["uploadAudio"] && (
          <PercentageLoading
            items={120}
            timePerItem={1000}
            id={"uploadAudio"}
          />
        )}
      </div>
    </>
  );
};

export default AudioButton;
