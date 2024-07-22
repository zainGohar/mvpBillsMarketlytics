import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ViewPoint } from "@/libs/common";
import {
  setCurrentSource,
  setModel,
  setSelectedFolderORFile,
} from "@/store/aiFileStructure";

const SourceBar = () => {
  const dispatch = useDispatch();

  const currentSource = useSelector(
    (state) => state.entities.aiFileStructure?.currentSource
  );

  const list = [
    {
      name: "Files",
      icon: "bi-file-earmark-text",
      value: "file",
    },
    {
      name: "Chat",
      icon: "bi-chat-left-text",
      value: "chat",
    },
    // {
    //   name: "Folder",
    //   icon: "bi-folder-check",
    //   value: "folder",
    // },
    // {
    //   name: "Youtube",
    //   icon: "bi-youtube",
    //   value: "youtube",
    // },
    // {
    //   name: "Website",
    //   icon: "bi-globe",
    //   value: "website",
    // },
    // {
    //   name: "Video",
    //   icon: "bi-camera-video",
    //   value: "video",
    // },
    // {
    //   name: "Audio",
    //   icon: "bi-mic",
    //   value: "audio",
    // },
  ];

  const view = ViewPoint("700px");

  function handleSelectSource(l) {
    dispatch(setCurrentSource(l?.value));
    dispatch(setModel({ type: "openai", name: "gpt-3.5-turbo" }));
    dispatch(
      setSelectedFolderORFile({
        id: null,
      })
    );
  }

  return (
    <>
      <div className={"file-sidebar"}>
        <div className={"side"}>
          <ul className={`ps-0`}>
            {list?.map((l) => {
              return (
                <li
                  className={`${currentSource == l?.value ? "active" : ""}`}
                  onClick={() => handleSelectSource(l)}
                >
                  <span className={`${!view ? "mb-1 mt-1" : "mb-0"} a`}>
                    <i className={`bi ${l?.icon}`} />
                  </span>
                  <p className={`${view ? "d-none" : "mb-0"} ${"p"}`}>
                    {l?.name}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SourceBar;
