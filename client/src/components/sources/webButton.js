import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setProgressType } from "@/store/aiFileStructure";
import { removeAllLoaders, setLoader } from "@/store/loader";
import PercentageLoading from "@/libs/percentageLoader";
import { Input } from "@/libs/input";
import Button from "@/libs/button/page";
import { uploadToServer } from "@/store/aiFileStructure";

const WebButton = () => {
  return (
    <div>
      <WebCovertButton />
    </div>
  );
};

export default WebButton;

export function WebCovertButton() {
  const dispatch = useDispatch();
  const StoreLoader = useSelector((state) => state.entities.loader);

  const [linkName, setLinkName] = useState("");

  const linkRef = useRef(null);

  const WebUrl = linkName;

  async function handleGeneratelinkFile() {
    try {
      await dispatch(setProgressType("link"));
      await dispatch(setLoader("linkUploadweb"));

      await dispatch(
        uploadToServer({
          data: { url: WebUrl },
          url: `/web`,
          type: "web",
        })
      );
    } catch (error) {
      dispatch(removeAllLoaders());
    }
  }

  //================================================================
  return (
    <>
      <div className="mb-2">
        <Input
          id="folder-name-input"
          type="text"
          refs={linkRef}
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          className="addFolderInput widthForUpload"
          placeholder="Add web url here"
        />

        <Button
          className="addFolderBtn simple-button widthForUpload"
          loading={StoreLoader && StoreLoader["linkUploadweb"] ? true : false}
          text="Insert Link"
          onClick={handleGeneratelinkFile}
        />
        {StoreLoader && StoreLoader["linkUploadweb"] && (
          <PercentageLoading
            items={120}
            timePerItem={1000}
            id={"linkUploadweb"}
          />
        )}
        <p className="font-box text-center widthForUpload  mb-0 mt-2">
          This will scrape a single specified page, excluding linked files.
        </p>
      </div>
    </>
  );
}
