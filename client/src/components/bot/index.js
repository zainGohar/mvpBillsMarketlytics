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
import UploadButton from "../sources/uploadButton";

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
      ////
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

  // function exportFile(values) {
  //   const sortData = values?.data;

  //   function transformData(data) {
  //     return [Object.keys(data), Object.values(data)];
  //   }

  //   const transformedData = transformData(sortData);

  //   const csv = Papa.unparse({
  //     fields: transformedData[0],
  //     data: [transformedData[1]],
  //   });

  //   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = "exported_data.csv";
  //   link.click();
  // }

  function exportFile(values) {
    const data = values?.data;

    function transformData(data) {
      if (data.Electricity && data.Gas) {
        console.log("gouble entry");
        const headers = Object.keys(data.Electricity || data.Gas);
        const rows = [];

        if (data.Electricity) {
          rows.push(Object.values(data.Electricity));
        }
        if (data.Gas) {
          rows.push(Object.values(data.Gas));
        }

        return { headers, rows };
      } else {
        console.log("single");
        const headers = Object.keys(data);
        const rows = [Object.values(data)];

        console.log({ headers });
        console.log({ rows });

        return { headers, rows };
      }
    }

    const transformedData = transformData(data);

    const csv = Papa.unparse({
      fields: transformedData.headers,
      data: transformedData.rows,
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

  const handleExport = async () => {
    try {
      let file_data = JSON.parse(localStorage.getItem("file_data")) || [];
      let allFileData = [];

      if (Array.isArray(file_data)) {
        file_data.forEach((item) => {
          const fileContent = JSON.parse(item.file);

          if (Array.isArray(fileContent)) {
            fileContent.forEach((content) => {
              allFileData.push(content);
            });
          } else {
            allFileData.push(fileContent);
          }
        });

        exportFile(allFileData);
      } else {
        console.log("file_data is not an array:", file_data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  function exportFile(data) {
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

      if (Array.isArray(data)) {
        for (const value of data) {
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
      <main className={"main position-relative w-100"}>
        <button className="export_btn" onClick={handleExport}>
          Export All
        </button>

        <div className="" style={{ margin: "auto" }}>
          <UploadButton />
        </div>
      </main>
    </div>
  );
}
