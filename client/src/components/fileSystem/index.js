import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserFiles,
  getUserFolders,
  setSelectedFolderORFile,
  setChatMobile,
  setModel,
} from "@/store/aiFileStructure";
import {
  getHistory,
  addUserMessage,
  clearPending,
  setStopChat,
} from "@/store/mainSlice";
import {
  getChatObject,
  handleCompleteChat,
  removeAssignFromStorage,
  saveAssignToStorage,
  updateAssignInStorage,
  updateFOlderInStorage,
} from "@/libs/localStorage/page";
import { showAlert } from "@/store/alert";
import { hideLoader, setLoader } from "@/store/loader";
import axios from "axios";
import Button from "@/libs/button/page";
import { ViewPoint } from "@/libs/common";
import Papa from "papaparse";
import { LoadingDots } from "@/libs/Loader";

const FilesSidebar = () => {
  const dispatch = useDispatch();
  const files = useSelector((state) => getUserFiles(state));

  const folders = useSelector((state) => getUserFolders(state));

  const assignedFiles = useSelector(
    (state) => state.entities?.aiFileStructure?.assignedFiles
  );

  const view = useSelector(
    (state) => state.entities?.aiFileStructure?.fileView
  );
  const [show, setShow] = useState(null);
  const [showFolder, setShowFolder] = useState(null);

  const [selectedFolder, setSelectedFolder] = useState({
    folder_id: "",
    folder_name: "",
    text_content: "",
    index: "",
  });
  const [fileIdsforFlder, setfileIdsforFlder] = useState(null);

  const statusType = view == 0 ? "active" : view == 1 ? "disable" : "";

  const fileData = files?.filter((f) => f.status == statusType);

  const folderData = folders?.filter((f) => f.status == statusType);
  const StoreLoader = useSelector((state) => state.entities.loader);

  console.log({ StoreLoader });

  var [checkedCount, setcheckedCount] = useState(0);
  //=================================================================
  const fileArray = useSelector((state) => getUserFiles(state));

  const assignedFileIds = assignedFiles?.map((assign) => assign.file_id);

  const [fileDta, setFileData] = useState(fileData);

  useEffect(() => {
    setFileData(fileData);
  }, [fileArray]);

  //=================================================================================================

  const handleAddToFolder = async (folder) => {
    if (checkedCount > 10) {
      return dispatch(
        showAlert(
          "Please note that the maximum number of files allowed is 10.",
          "error"
        )
      );
    }
    const selectedFiles = fileDta.filter((file) => file.checked);
    if (!selectedFiles?.length) {
      return dispatch(showAlert("Please select a file.", "error"));
    }
    dispatch(setLoader("assignFile"));
    const file_ids = selectedFiles?.map((f) => f.file_id);
    const result = await callFolderApi(folder);

    if (result?.status == 200) {
      await updateFOlderInStorage({
        folder_id: result?.data?.success?.file?.name,
        folder_name: folder.folder_name,
        text_content: result?.data?.success?.textContent,
        prev_id: folder.folder_id,
        dispatch,
      });
      await saveAssignToStorage({
        folder_id: result?.data?.success?.file?.name,
        file_ids,
        prev_id: folder.folder_id,
        dispatch,
      });
    }
    setcheckedCount(0);
    setShow(null);
    setShow(folder.index);
    dispatch(hideLoader("assignFile"));
  };

  const handleRemoveFromFolder = async (folder) => {
    const selectedFiles = fileDta.filter((file) => file.checked);
    if (!selectedFiles?.length) {
      return dispatch(showAlert("Please select a file.", "error"));
    }
    dispatch(setLoader("assignFile"));
    const file_ids = selectedFiles?.map((f) => f.file_id);
    const result = await callFolderApi(folder);

    if (result?.status == 200) {
      await removeAssignFromStorage({
        file_ids,
        dispatch,
      });

      await updateFOlderInStorage({
        folder_id: result?.data?.success?.file?.name,
        folder_name: folder.folder_name,
        text_content: result?.data?.success?.textContent,
        prev_id: folder.folder_id,
        dispatch,
      });

      await updateAssignInStorage({
        folder_id: result?.data?.success?.file?.name,
        prev_id: folder.folder_id,
        dispatch,
      });
    }

    setcheckedCount(0);
    setShow(null);
    setShow(folder.index);
    dispatch(hideLoader("assignFile"));
  };

  const callFolderApi = async (folder) => {
    const selectedFiles = fileDta?.filter((file) => file.checked);
    const file_ids = selectedFiles?.map((f) => f.file_id);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/back/folder`,
      {
        files_to_add: fileIdsforFlder == "add" ? selectedFiles : "",
        text_content: folder?.text_content ?? "",
        files_to_remove: fileIdsforFlder == "remove" ? file_ids : "",
        folder_id: folder.folder_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  };

  //===================================================================================================
  return (
    <div
      className={` ${
        files?.length || folderData?.length
          ? `flex-column justify-content-around align-items-start file-sidebar ${
              show == "checked" ? "h-100" : ""
            }`
          : "h-100"
      } `}
    >
      <div className="contet_bottom h-100  w-100 position-relative">
        {fileData?.length || folderData?.length ? (
          <div className={`list-main d-flex `}>
            <div className={` ${show == "checked" ? "list01" : "list1"}`}>
              {folderData?.reverse().map((folder, i) => {
                return (
                  <div key={i}>
                    <FileStructure
                      folder_data={true}
                      index={i}
                      data={folder}
                      view={view}
                      showFolder={showFolder}
                      setShowFolder={setShowFolder}
                      setfileIdsforFlder={setfileIdsforFlder}
                      fileDta={fileDta}
                      setSelectedFolder={setSelectedFolder}
                      selectedFolder={selectedFolder}
                      checkedCount={checkedCount}
                      setcheckedCount={setcheckedCount}
                      setFileData={setFileData}
                      setShow={setShow}
                      show={show}
                      statusType={statusType}
                    />

                    <div
                      className="ms-3 folder_file_box scrollbar"
                      style={{
                        height: showFolder === i ? "100%" : "0px",
                        display: showFolder === i ? "block" : "none",
                      }}
                    >
                      {fileData
                        ?.filter((file) =>
                          assignedFiles?.some(
                            (assign) =>
                              assign.file_id === file.file_id &&
                              assign.folder_id === folder.folder_id
                          )
                        )
                        .map((file, j) => (
                          <FileStructure
                            folder_files={true}
                            data={file}
                            view={view}
                            index={j}
                          />
                        ))}
                    </div>
                  </div>
                );
              })}
              {fileData
                ?.reverse()
                ?.filter((f) => !assignedFileIds?.includes(f.file_id))
                ?.map((data, i) => {
                  return (
                    <FileStructure
                      main_files={true}
                      data={data}
                      view={view}
                      setShow={setShow}
                      show={show}
                      statusType={statusType}
                      index={i}
                    />
                  );
                })}
            </div>

            <div
              className={` ${
                show == "checked"
                  ? "list2"
                  : fileData?.length || folderData?.length
                  ? "list02"
                  : "w-100"
              } `}
            >
              <div className="d-flex position-relative text align-items-center justify-content-center"></div>

              {fileDta
                ?.filter((f) =>
                  fileIdsforFlder == "add"
                    ? !assignedFileIds?.includes(f.file_id)
                    : assignedFiles?.some(
                        (assign) =>
                          assign.file_id === f.file_id &&
                          assign.folder_id === selectedFolder?.folder_id
                      )
                )
                ?.map((data, i) => {
                  return (
                    <FileStructure
                      check_files={true}
                      data={data}
                      view={view}
                      setFileData={setFileData}
                      checkedCount={checkedCount}
                      setcheckedCount={setcheckedCount}
                      index={i}
                    />
                  );
                })}
            </div>
          </div>
        ) : (
          <Nofile />
        )}
        {show == "checked" && (
          <div className="d-flex justify-content-between align-items-center w-100 addfile_btn mt-3">
            <div
              className="mx-1 w-100 w-sm-auto mb-2"
              style={{
                maxWidth: !view ? "100%" : "150px",
                minWidth: "50px",
              }}
            >
              <Button
                text="Cancel"
                className="borderButton"
                onClick={() => setShow(null)}
                disabled={
                  StoreLoader && StoreLoader["assignFile"] ? true : false
                }
                opacity={
                  StoreLoader && StoreLoader["assignFile"] ? "60%" : "100%"
                }
                overflow={true}
              />
            </div>
            <div
              className="mx-1 mb-2  w-100 w-sm-auto"
              style={{
                maxWidth: !view ? "100%" : "150px",
                minWidth: "50px",
              }}
            >
              <Button
                text={`${fileIdsforFlder == "add" ? "Add" : "Remove"} ${
                  checkedCount > 1 ? "Files" : "File"
                } `}
                className="simple-button text-center text-white "
                onClick={() =>
                  fileIdsforFlder == "add"
                    ? handleAddToFolder(selectedFolder)
                    : handleRemoveFromFolder(selectedFolder)
                }
                disabled={checkedCount == 0 ? true : false}
                opacity={checkedCount == 0 ? "60%" : "100%"}
                backgroundColor={checkedCount > 10 ? "#ff4d4d" : "#422afa"}
                id="assignFile"
                overflow={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesSidebar;

export const Nofile = () => {
  return (
    <>
      <div className="no-file mt-3 h-100 w-100">
        <h1 className="bi bi-file-earmark-x text" />
        <h5 className="text text-center mt-2">
          No FIles <br />
          To Show!
        </h5>
      </div>
    </>
  );
};

const FileStructure = (props) => {
  const {
    data,
    folder_files,
    check_files,
    setFileData,
    checkedCount,
    setcheckedCount,
    folder_data,
    index,
    showFolder,
    setShowFolder,
    setfileIdsforFlder,
    fileDta,
    setSelectedFolder,
    setShow,
    show,
    statusType,
  } = props;

  console.log({ index });

  const mobileView = ViewPoint("700px");

  const dispatch = useDispatch();
  const files = useSelector((state) => getUserFiles(state));
  const assignedFiles = useSelector(
    (state) => state.entities?.aiFileStructure?.assignedFiles
  );
  const WebView = ViewPoint("600px");

  const [showIcons, setShowIcons] = useState("showHover");

  const fileData = files?.filter((f) => f.status == statusType);

  const _id = useSelector(
    (state) => state?.entities?.aiFileStructure?.selectedFolder?.id
  );

  const StoreLoader = useSelector((state) => state.entities.loader);
  //=================================================================

  const handleShowFiles = ({ i }) => {
    if (showFolder == i) {
      setShowFolder(null);
    } else {
      setShowFolder(i);
    }
  };

  const handleShowCheck = ({ i, type }) => {
    setSelectedFolder({
      folder_id: data.folder_id,
      folder_name: data.folder_name,
      text_content: data.text_content,
      index: i,
    });
    setShow("checked");
    setcheckedCount(0);
    setfileIdsforFlder(type);

    const fileLength = fileDta?.filter((file) =>
      assignedFiles?.some(
        (assign) =>
          assign.file_id === file.file_id && assign.folder_id === data.folder_id
      )
    )?.length;

    setFileData((prevState) =>
      prevState.map((file) => {
        return { ...file, checked: false };
      })
    );

    setcheckedCount(fileLength);
  };

  const handleCheckFile = async ({ folderId, fileId, checked }) => {
    if (checked) {
      setcheckedCount(checkedCount + 1);
    } else {
      setcheckedCount(checkedCount - 1);
    }

    setFileData((prevState) =>
      prevState.map((file) => {
        if (file.file_id === fileId) {
          return { ...file, checked };
        }
        return file;
      })
    );
  };

  async function handleClick(val) {
    const data_id = val[folder_data ? "folder_id" : "file_id"];
    const data_name = val[folder_data ? "folder_name" : "file_name"];
    StoreLoader &&
      StoreLoader["chatLoader"] &&
      (await handleCompleteChat("false", dispatch));

    if (_id !== data_id) {
      const chatData = await getChatObject(data_id);
      await dispatch(getHistory(chatData));
    }
    if (show) {
      setShow(null);
    }
    dispatch(setModel({ type: val.model_type, name: val.model }));
    dispatch(
      setSelectedFolderORFile({
        id: data_id,
        group: folder_data ? true : false,
        name: data_name,
        type: val?.type,
      })
    );
    mobileView ? dispatch(setChatMobile(true)) : null;
  }

  //===========================================================================================
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  console.log({ selected });

  const selectedModel = useSelector(
    (state) => state?.entities?.aiFileStructure?.model
  );
  console.log({ selectedModel });

  const handleSubmit = async (index) => {
    setSelected(index);

    const question = query.trim();
    dispatch(addUserMessage({ question, _id }));
    await dispatch(setLoader("chatLoader"));
    setQuery("");
    dispatch(clearPending());

    const ctrl = new AbortController();
    await dispatch(setStopChat(ctrl));

    try {
      const axiosResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/back/chat?model-type=${selectedModel?.type}&model=${selectedModel?.name}`,
        {
          question,
          history: "",
          file_id: _id,
          streaming: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("axiosResponse", axiosResponse.data);
      await exportFile(axiosResponse.data);
      await dispatch(hideLoader("chatLoader"));
      setSelected(null);
    } catch (error) {
      await dispatch(hideLoader("chatLoader"));
      console.log("error", error);
    }
  };

  // function exportFile(values) {
  //   const data = values?.data;

  //   function transformData(data) {
  //     if (data.Electricity && data.Gas) {
  //       console.log("gouble entry");
  //       const headers = Object.keys(data.Electricity || data.Gas);
  //       const rows = [];

  //       if (data.Electricity) {
  //         rows.push(Object.values(data.Electricity));
  //       }
  //       if (data.Gas) {
  //         rows.push(Object.values(data.Gas));
  //       }

  //       return { headers, rows };
  //     } else {
  //       console.log("single");
  //       const headers = Object.keys(data);
  //       const rows = [Object.values(data)];

  //       console.log({ headers });
  //       console.log({ rows });

  //       return { headers, rows };
  //     }
  //   }

  //   const transformedData = transformData(data);

  //   const csv = Papa.unparse({
  //     fields: transformedData.headers,
  //     data: transformedData.rows,
  //   });

  //   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = "exported_data.csv";
  //   link.click();
  // }

  function exportFile(values) {
    const data = values?.data;

    function flattenObject(ob) {
      const toReturn = {};

      for (const i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if (typeof ob[i] === "object" && ob[i] !== null) {
          const flatObject = flattenObject(ob[i]);
          for (const x in flatObject) {
            if (!flatObject.hasOwnProperty(x)) continue;
            toReturn[i + "." + x] = flatObject[x];
          }
        } else {
          toReturn[i] = ob[i];
        }
      }
      return toReturn;
    }

    function transformData(data) {
      const rows = [];

      if (data.Electricity || data.Gas) {
        for (const [key, value] of Object.entries(data)) {
          rows.push(flattenObject(value));
        }
      } else {
        rows.push(flattenObject(data));
      }

      const headers = Array.from(
        new Set(rows.flatMap((row) => Object.keys(row)))
      );

      return { headers, rows };
    }

    const transformedData = transformData(data);

    const csv = Papa.unparse({
      fields: transformedData.headers,
      data: transformedData.rows.map((row) =>
        transformedData.headers.map((header) => row[header] || "")
      ),
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "exported_data.csv";
    link.click();
  }

  const handleResponse = async (status) => {
    setTimeout(() => {
      textareaRef1.current?.focus();
    }, 300);
    await handleCompleteChat(status, dispatch);
  };

  //===================================================================================================

  return (
    <div
      key={data[folder_data ? "folder_id" : "file_id"]}
      className="position-relative d-flex file-button-box"
      onMouseOver={() => setShowIcons("showPermanent")}
      onMouseOut={() => setShowIcons(WebView ? "showPermanent" : "showHover")}
      onClick={(e) => (check_files ? e.stopPropagation() : handleClick(data))}
    >
      <div
        className={`w-100 defaultbtn ${
          data[folder_data ? "folder_id" : "file_id"] == _id
            ? "active"
            : "default"
        }-file-color px-2`}
      >
        {check_files ? (
          <input
            type="checkbox"
            onChange={(e) => {
              e.stopPropagation(),
                handleCheckFile({
                  fileId: data.file_id,
                  checked: e.target.checked,
                });
            }}
            checked={data.checked}
            className="checkBtnFile mt-1 me-1 "
          />
        ) : null}

        {folder_data && (
          <div
            className={`position-absolute d-flex folderAddSub ${
              WebView
                ? ""
                : data[folder_data ? "folder_id" : "file_id"] == _id
                ? "showPermanent"
                : showIcons
            } `}
            style={{ right: "10px" }}
          >
            <div
              title="remove file"
              onClick={(e) => {
                e.stopPropagation(),
                  handleShowCheck({ i: index, type: "remove" });
              }}
              className="bi bi-dash-circle mx-1 folderButtons"
            />
            <div
              title="add file"
              onClick={(e) => {
                e.stopPropagation(), handleShowCheck({ i: index, type: "add" });
              }}
              className="bi bi-plus-circle mx-1 folderButtons"
            />
          </div>
        )}

        <div className="d-flex align-items-center ">
          <Button
            iconOnClick={() => handleShowFiles({ i: index })}
            text={data.file_name}
            icon={`bi ${
              folder_data
                ? `bi-chevron-${showFolder == index ? "down" : "right"}`
                : data.type == "link"
                ? "bi-youtube"
                : data.type == "video"
                ? "bi-camera-video"
                : data.type == "audio"
                ? "bi-mic"
                : data.type == "web"
                ? "bi bi-globe"
                : "bi-card-text"
            }  me-2`}
            className={` file_button  ${check_files ? "ms-3 ps-3" : ""}  ${
              folder_files ? "ps-3" : ""
            } px-3`}
            width={"95%"}
          />

          {StoreLoader?.["chatLoader"] && index === selected ? (
            <>
              <div
                className={"loadingwheel"}
                style={{ position: "relative", left: "-12px" }}
              >
                <LoadingDots />
              </div>
            </>
          ) : (
            <Button
              className=""
              onClick={() => handleSubmit(index)}
              icon="bi bi-download"
            />
          )}
        </div>
      </div>
    </div>
  );
};
