import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setProgressType, uploadToServer } from "@/store/aiFileStructure";
import { removeAllLoaders, setLoader } from "@/store/loader";
import PercentageLoading from "@/libs/percentageLoader";
import { Input } from "@/libs/input";
import Button from "@/libs/button/page";

export default function YoutubeButton() {
  const dispatch = useDispatch();
  const StoreLoader = useSelector((state) => state.entities.loader);

  const [linkName, setLinkName] = useState("");
  const youtubeUrl = linkName;

  async function handleGeneratelinkFile() {
    try {
      await dispatch(setProgressType("link"));
      await dispatch(setLoader("linkUpload"));

      await dispatch(
        uploadToServer({
          data: { url: youtubeUrl },
          url: `/youtube`,
          type: "link",
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
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          className="addFolderInput widthForUpload"
          placeholder="Add youtube link here"
        />

        <Button
          className="addFolderBtn widthForUpload simple-button"
          loading={StoreLoader && StoreLoader["linkUpload"] ? true : false}
          text="Insert Link"
          onClick={handleGeneratelinkFile}
        />

        {StoreLoader && StoreLoader["linkUpload"] && (
          <PercentageLoading items={120} timePerItem={1000} id={"linkUpload"} />
        )}
        <p className="font-box text-center widthForUpload mb-0 mt-2">
          This will scrape a youtube video.
        </p>
      </div>
    </>
  );
}
