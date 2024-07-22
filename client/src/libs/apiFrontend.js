"use client";
import axios from "axios";
import { hideLoader, removeAllLoaders, setLoader } from "../store/loader";
import { showAlert } from "../store/alert";
import { store } from "../store/configureStore";

import { logoutFromReduxMiddleware } from "@/libs/logout";

export default async function ApiFrontend(api) {
  axios.defaults.withCredentials = true;
  const { url, method, data } = api;

  try {
    axios.defaults.headers.common["userid"] =
      store.getState().entities.credentials.user_id;
    axios.defaults.headers.common["useremail"] =
      store.getState().entities.credentials.email_id;

    if (api?.fieldId) store.dispatch(setLoader(api?.fieldId));

    const response = await axios.request({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/back`,
      url,
      method,
      data,
      withCredentials: true,
    });

    if (api?.fieldId) store.dispatch(hideLoader(api?.fieldId));

    if (
      response?.data?.message?.content &&
      response?.data?.message?.displayContent
    ) {
      store.dispatch(showAlert(response?.data?.message?.content, "success"));
    }

    return response.data;
  } catch (error) {
    logoutFromReduxMiddleware(error?.response?.status);
    if (
      error?.response?.data?.message?.displayContent &&
      error?.response?.data?.message?.content
    ) {
      store.dispatch(
        showAlert(error?.response?.data?.message?.content, "error")
      );
    }
    store.dispatch(removeAllLoaders());
    // throw error;
  }
}
