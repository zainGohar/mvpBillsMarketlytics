import axios from "axios";
import { showAlert } from "../alert";
import * as actions from "../api";
import { setLoader, hideLoader, removeAllLoaders } from "./../loader";
import { logoutFromReduxMiddleware } from "@/libs/logout";

axios.defaults.withCredentials = true;

const handleSuccess = (dispatch, response, onSuccess, getState) => {
  dispatch(actions.apiCallSuccess(response?.data));
  if (onSuccess) {
    const successActions = Array.isArray(onSuccess) ? onSuccess : [onSuccess];
    successActions.forEach((action) => {
      if (typeof action === "function") {
        action(response?.data);
      } else if (action?.func) {
        const params = action?.store
          ? [...action.params, getState()]
          : action.params;
        action.func(...params);
      } else {
        dispatch({ type: action, payload: response.data });
      }
    });
  }
  if (
    response?.data?.message?.content &&
    response?.data?.message?.displayContent
  ) {
    dispatch(showAlert(response?.data?.message?.content, "success"));
  }
};

const handleError = (dispatch, error, onError, getState) => {
  console.error("API call error:", error);
  dispatch(removeAllLoaders());
  dispatch(actions.apiCallFailed(error));
  logoutFromReduxMiddleware(error?.response?.status);

  if (onError) {
    const errorActions = Array.isArray(onError) ? onError : [onError];
    errorActions.forEach((action) => {
      if (typeof action === "function") {
        action(error?.response);
      } else if (action?.func) {
        const params = action?.store
          ? [...action.params, getState()]
          : action.params;
        action.func(...params);
      } else {
        dispatch({ type: action, payload: error.response?.data });
      }
    });
  }
  if (
    error?.response?.data?.message?.displayContent &&
    error?.response?.data?.message?.content
  ) {
    dispatch(showAlert(error?.response?.data?.message?.content, "error"));
  }
};

const api =
  ({ dispatch, getState }) =>
  (next) =>
  async (action) => {
    if (action.type !== actions.apiCallBegan.type) return next(action);
    next(action);

    const { url, method, data, onSuccess, onError, fieldId } = action.payload;

    try {
      axios.defaults.headers.common = {
        userId: getState().entities?.credentials?.user_id,
        userEmail: getState().entities?.credentials?.email_id,
      };

      if (fieldId) dispatch(setLoader(fieldId));

      const response = await axios.request({
        baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/back`,
        url,
        method,
        data,
      });

      if (fieldId) dispatch(hideLoader(fieldId));

      handleSuccess(dispatch, response, onSuccess, getState);
    } catch (error) {
      handleError(dispatch, error, onError, getState);
    }
  };

export default api;
