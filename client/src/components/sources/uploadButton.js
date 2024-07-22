import React from "react";
import {
  getUserFiles,
  setCurrentSource,
  setFile,
  setProgressType,
  uploadToServer,
} from "@/store/aiFileStructure";
import { useDispatch, useSelector } from "react-redux";
import { setLoader } from "@/store/loader";
import path from "path";
import PercentageLoading from "@/libs/percentageLoader";
import Button from "@/libs/button/page";
import { handleUniqueName, removeExtension } from "@/libs/common";

const UploadButton = () => {
  const dispatch = useDispatch();

  const files = useSelector((state) => getUserFiles(state));
  const StoreLoader = useSelector((state) => state.entities.loader);

  const acceptFiles = "application/pdf,text/csv,text/plain,application/msword";

  async function handleUpload(event) {
    const i = event?.target?.files[0];
    let name = await handleUniqueName(files, i?.name);
    dispatch(setFile(i));
    await dispatch(setProgressType("file"));
    await dispatch(setLoader("uploadfile"));
    const formData = new FormData();
    formData.append("file", i);
    await dispatch(
      uploadToServer({
        data: formData,
        name,
        url: `/file`,
        type: "file",
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
                StoreLoader && StoreLoader["uploadfile"] ? "none" : "auto",
            }}
            onChange={handleUpload}
            accept={acceptFiles}
          />

          <Button
            text={
              <div className="d-flex flex-column align-items-center justify-content-center mb-3 px-2 px-sm-5">
                <span className="font-box fw-semibold d-sm-block d-none mb-1">
                  Drag and Drop files here or click to select files
                </span>
                <span className="font-box fw-semibold d-sm-none d-block mb-1">
                  Click to select files
                </span>
                <span className="font-box d-sm-block d-none">
                  Supported file type .doc, txt, .csv, .pdf
                </span>
                <span className="font-box d-sm-none d-block">
                  .doc, txt, .csv, .pdf
                </span>
              </div>
            }
            id="uploadfile"
            className="upload_box"
            BIcon="bi bi-upload font-bold fs-5"
            loading={StoreLoader && StoreLoader["uploadfile"] ? true : false}
            LoaderPosition="end"
          />
        </div>
        {StoreLoader && StoreLoader["uploadfile"] && (
          <PercentageLoading items={120} timePerItem={1000} id={"uploadfile"} />
        )}
      </div>
    </>
  );
};

export default UploadButton;
