"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SourceBar from "../sourceBar/sourceBar";
import SourceAndBot from "../sourceAndBot";
import { getUserFiles, getdataOnHome, setModel } from "@/store/aiFileStructure";
import ApiFrontend from "@/libs/apiFrontend";
import { useRouter } from "next/navigation";
import { DropButton } from "@/libs/button/page";
import { setMode } from "@/store/mainSlice";

const Admin = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const showChatMobile = useSelector(
    (state) => state?.entities?.credentials?.showChatMobile
  );

  const planName = useSelector(
    (state) => state?.entities?.credentials?.selectedPlan
  );

  const selectedModel = useSelector(
    (state) => state?.entities?.aiFileStructure?.model
  );

  const currentSource = useSelector(
    (state) => state.entities.aiFileStructure?.currentSource
  );

  async function upgradePlan() {
    const response = await ApiFrontend({
      url: "/payment/create-customer-portal-session",
      method: "post",
      dispatch,
      fieldId: "managesub",
    });
    const url = response?.success?.url;
    // Redirect to the Stripe Checkout page
    window.location.href = url;
  }

  const isFreePlanActivated = planName === "free";

  const list = [
    {
      heading: "Plan Name",
      text: `Your current plan is: ${planName}`,
      icon: "bi-person",
      link: isFreePlanActivated ? "Update" : "Manage Subscription",
      to: isFreePlanActivated ? null : upgradePlan,
      path: isFreePlanActivated ? "/pricing" : "",
    },
    {
      heading: "Password",
      text: `Change your password`,
      icon: "bi-lock",
      link: "Change",
      path: "/change-password",
    },
  ];

  const isDisabled = (currentSource, selectedModel, modelType) => {
    return currentSource === "chat" && selectedModel.type !== modelType;
  };

  const models = [
    {
      img: "gpt-3",
      link: "gpt-3.5-turbo",
      id: 0,
      type: "openai",
    },
    {
      img: "gpt-4",
      link: "gpt-4",
      id: 1,
      type: "openai",
    },
    {
      img: "gpt-4",
      link: "gpt-4-1106-preview",
      id: 5,
      type: "openai",
    },
    {
      img: "claude",
      link: "claude-2.1",
      id: 2,
      type: "anthropic",
    },
    {
      img: "gemini",
      link: "gemini-pro",
      id: 3,
      type: "gemini-pro",
    },
  ].map((model) => ({
    ...model,
    onClick: () => handleSelectModel(model.link, model.type),
    disabled: isDisabled(currentSource, selectedModel, model.type),
  }));

  function handleSelectModel(name, type) {
    dispatch(setModel({ type, name }));
  }
  //================================================

  const files = useSelector((state) => getUserFiles(state));

  const getDataForuser = async () => {
    let file_data = (await JSON.parse(localStorage.getItem(`file_data`))) || [];
    let assign_data =
      (await JSON.parse(localStorage.getItem(`asign_data`))) || [];
    let folder_data =
      (await JSON.parse(localStorage.getItem(`folder_data`))) || [];

    dispatch(getdataOnHome({ file_data, folder_data, assign_data }));
  };

  useEffect(() => {
    if (!files?.length) getDataForuser();
  }, []);

  return (
    <div className="px-4 pb-4">
      <div className="py-4 d-sm-flex d-block">
        {list.map((l) => {
          return (
            <div className="section-box card mx-2 my-sm-0 my-3">
              <i className={`bi ${l.icon} icon`} />
              <p className="heading">{l.heading}</p>
              <p className="text">{l.text}</p>
              <div
                onClick={l?.to ? l?.to : () => router.push(l.path)}
                className="link"
              >
                {l.link}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mx-2 mt-0 d-flex ai-box">
        <div
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            zIndex: "99999",
          }}
          className="box"
        >
          <DropButton
            text={
              <p className="drop-text px-3 pt-1 pb-2 rounded">
                {selectedModel?.name}
              </p>
            }
            list={models}
          />
        </div>

        <div
          className="col-2 px-0 source-bar"
          style={{
            display: showChatMobile ? "none" : "block",
          }}
        >
          <SourceBar />
        </div>

        <div
          className={`col-${
            showChatMobile ? "12" : "10"
          } col-sm-10 px-0 d-flex justify-content-center align-items-center`}
        >
          <SourceAndBot />
        </div>
      </div>
    </div>
  );
};

export default Admin;
