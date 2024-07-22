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

const VideoButton = () => {
  const dispatch = useDispatch();

  const files = useSelector((state) => getUserFiles(state));

  const StoreLoader = useSelector((state) => state.entities.loader);
  const acceptFiles =
    "video/mp4,video/x-msvideo,video/x-matroska,video/quicktime";

  async function handleUpload(event) {
    const i = event?.target?.files[0];
    let name = await handleUniqueName(files, i?.name);

    dispatch(setFile(i));
    await dispatch(setProgressType("file"));
    await dispatch(setLoader("uploadVideo"));
    const formData = new FormData();
    formData.append("file", i);
    await dispatch(
      uploadToServer({
        data: formData,
        name,
        url: `/video`,
        type: "video",
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
                StoreLoader && StoreLoader["uploadVideo"] ? "none" : "auto",
            }}
            onChange={handleUpload}
            accept={acceptFiles}
          />

          <Button
            text={
              <div className="d-flex flex-column align-items-center justify-content-center mb-3 px-2 px-sm-5">
                <span className="font-box fw-semibold d-sm-block d-none mb-1">
                  Drag and Drop video here or click to select video
                </span>
                <span className="font-box fw-semibold d-sm-none d-block mb-1">
                  Click to select video
                </span>
                <span className="font-box  d-sm-block d-none">
                  Supported formats type .mp4, .avi, .mkv, .mov
                </span>
                <span className="font-box  d-sm-none d-block">
                  .mp4, .avi, .mkv, .mov
                </span>
              </div>
            }
            id="uploadVideo"
            className="upload_box"
            BIcon="bi bi-upload font-bold fs-5"
            loading={StoreLoader && StoreLoader["uploadVideo"] ? true : false}
            LoaderPosition="end"
          />
        </div>
        {StoreLoader && StoreLoader["uploadVideo"] && (
          <PercentageLoading
            items={120}
            timePerItem={1000}
            id={"uploadVideo"}
          />
        )}
      </div>
    </>
  );
};

export default VideoButton;
