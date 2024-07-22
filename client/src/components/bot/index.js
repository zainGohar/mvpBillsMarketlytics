import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import FileSystem from "../fileSystem";
import { handleCompleteChat } from "@/libs/localStorage/page";
import {
  getUserFiles,
  getUserFolders,
  setChatMobile,
} from "@/store/aiFileStructure";
import { ViewPoint } from "@/libs/common";
import { hideLoader, setLoader } from "@/store/loader";
import {
  addUserMessage,
  clearPending,
  addPendingData,
  setStopChat,
  addSourceDocs,
} from "@/store/mainSlice";
import Button from "@/libs/button/page";
import { LoadingDots } from "@/libs/Loader";
import { showAlert } from "@/store/alert";
import getLightDarkValue from "@/libs/theme/page";
import { config } from "../../../config";
import axios from "axios";
import Papa from "papaparse";

export default function Bot() {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");

  const messageState = useSelector(
    (state) => state?.entities?.mainSlice?.messageState
  );

  const { messages, pending, pendingSourceDocs } = messageState;

  const _id = useSelector(
    (state) => state?.entities?.aiFileStructure?.selectedFolder?.id
  );

  console.log({ _id });

  const file_name = useSelector(
    (state) => state?.entities?.aiFileStructure?.selectedFolder?.name
  );

  const showChatMobile = useSelector(
    (state) => state?.entities?.aiFileStructure?.showChatMobile
  );
  const selectedModel = useSelector(
    (state) => state?.entities?.aiFileStructure?.model
  );
  const StoreLoader = useSelector((state) => state.entities.loader);

  const messageListRef = useRef(null);
  const files = useSelector((state) => getUserFiles(state));
  const folders = useSelector((state) => getUserFolders(state));

  const textareaRef1 = useRef();

  const handleInput = (event) => {
    const textarea = event.target;
    textarea.parentNode.dataset.replicatedValue = textarea.value;
  };

  const handleSetMessage = (e) => {
    setQuery(e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    // if (!query) {
    //   return;
    // }
    const question = query.trim();
    dispatch(addUserMessage({ question, _id }));
    await dispatch(setLoader("chatLoader"));
    setQuery("");
    dispatch(clearPending());

    const ctrl = new AbortController();
    await dispatch(setStopChat(ctrl));

    try {
      // fetchEventSource(
      //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/back/chat?model=${selectedModel?.name}&model-type=${selectedModel?.type}`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       question,
      //       history: "",
      //       file_id: _id,
      //     }),
      //     signal: ctrl.signal,

      //     onmessage: (event) => {
      //       console.log("data", event);
      //       if (event.data === "[DONE]") {
      //         handleResponse("true");
      //       } else {
      //         const data = JSON.parse(event.data);
      //         if (data.sourceDocs) {
      //           dispatch(addSourceDocs(data));
      //         } else {
      //           dispatch(addPendingData(data));
      //         }
      //       }
      //     },
      //   }
      // );

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
    } catch (error) {
      await dispatch(hideLoader("chatLoader"));
      console.log("error", error);
    }
  }

  function exportFile(values) {
    const sortData = values?.data;

    function transformData(data) {
      return [Object.keys(data), Object.values(data)];
    }

    const transformedData = transformData(sortData);

    const csv = Papa.unparse({
      fields: transformedData[0],
      data: [transformedData[1]],
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

  const handleEnter = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey && query) {
        e.preventDefault();
        handleSubmit(e);
      } else if (e.key == "Enter" && !e.shiftKey) {
        e.preventDefault();
      } else if (e.key === "Enter" && e.shiftKey) {
        console.log("Shift + Enter key pressed");
      }
    },
    [query]
  );

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending
        ? [
            {
              type: "apiMessage",
              message: pending,
              sourceDocs: pendingSourceDocs,
            },
          ]
        : []),
    ];
  }, [messages, pending, pendingSourceDocs]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleClickinput = () => {
    if (!_id) {
      dispatch(showAlert("Please select file to start conversation", "error"));
    }
  };

  const view = ViewPoint("700px");
  const imgClass = getLightDarkValue("img-light", "img-dark");

  return (
    <div className="d-flex position-relative h-100 w-100">
      <div
        className={`file-sidebar-box ${view ? "file-sidebar-mobile" : "col-3"}`}
        style={{
          display: view ? (showChatMobile ? "none" : "block") : "block",
        }}
      >
        <FileSystem />
      </div>
      <main className={"main position-relative"}>
        {/* {view ? (
          <div className="mobile-header">
            <i
              className="bi bi-arrow-left ps-3"
              style={{
                fontSize: "18px",
                zIndex: "1000",
              }}
              onClick={() => dispatch(setChatMobile(false))}
            />
            <p className="mb-0 ms-4">{file_name}</p>
          </div>
        ) : null}
        <div className={"cloud flex-column mt-5 mt-sm-4"}>
          <div ref={messageListRef} className={"messagelist"}>
            {chatMessages.map((message, index) => {
              let icon;
              let className;
              if (message.type === "apiMessage") {
                icon = (
                  <Image
                    src={`/images/${config.icon}`}
                    alt="AI"
                    width="40"
                    height="40"
                    className={`boticon ${imgClass}`}
                    priority
                  />
                );
                className = "apimessage";
              } else {
                icon = (
                  <>
                    <i className="bi bi-person-fill usericonBoot" />
                  </>
                );
                className =
                  StoreLoader &&
                  StoreLoader["chatLoader"] &&
                  index === chatMessages.length - 1
                    ? "usermessagewaiting"
                    : "usermessage";
              }
              return (
                <>
                  <div key={`chatMessage-${index}`} className={className}>
                    {icon}
                    <div className={"markdownanswer"}>
                      <pre className="MsgResponse mb-0">{message.message}</pre>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div> */}

        {/* <div className={`center px-3 px-sm-5`}>
          <div className={"cloudform"}>
            <form onSubmit={handleSubmit} action="#0">
              <div className="grow-wrap">
                <textarea
                  readOnly={!_id ? true : false}
                  disabled={
                    StoreLoader && StoreLoader["chatLoader"] ? true : false
                  }
                  style={{
                    opacity: files?.length || folders?.length ? "100%" : "20%",
                  }}
                  onKeyDown={handleEnter}
                  ref={textareaRef1}
                  autoFocus={false}
                  maxLength={700}
                  rows={1}
                  id="userInput"
                  name="userInput"
                  placeholder={
                    StoreLoader && StoreLoader["chatLoader"]
                      ? "Waiting for response..."
                      : files?.length == 0
                      ? "Upload file to start conversation"
                      : "Ask a question about your document?"
                  }
                  value={query}
                  onClick={handleClickinput}
                  onChange={(e) => handleSetMessage(e)}
                  onInput={handleInput}
                  className={"scrollbar"}
                />
              </div>
              <button type="submit" className={"generatebutton"}>
                {StoreLoader?.["chatLoader"] ? (
                  <>
                    <div className={"loadingwheel"}>
                      <LoadingDots />
                    </div>

                    <Button
                      className="chatCancelButton border"
                      icon="bi bi-x-lg"
                      onClick={(e) => {
                        e?.stopPropagation(), handleResponse("false");
                      }}
                    />
                  </>
                ) : (
                  <div
                    className={`animation bi bi-send-fill ${
                      query ? "svg-filled" : "svgicon"
                    }`}
                  />
                )}
              </button>
            </form>
          </div>
        </div> */}

        <button
          onClick={handleSubmit}
          className={"Download_Button"}
          disabled={!_id}
        >
          {StoreLoader?.["chatLoader"] ? (
            <>
              <div className={"loadingwheel"}>
                <LoadingDots />
              </div>
            </>
          ) : (
            <div className={`animation`}>
              {_id && (
                <i
                  class="bi bi-download"
                  style={{ fontSize: "20px", color: "var(--text)" }}
                ></i>
              )}
              <p className="my-2" style={{ color: "var(--text_secondary)" }}>
                {_id ? _id : "Please select file"}
              </p>
            </div>
          )}
        </button>
      </main>
    </div>
  );
}
