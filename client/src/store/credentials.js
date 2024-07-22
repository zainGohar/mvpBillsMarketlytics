import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiCallBegan } from "./api";

const slice = createSlice({
  name: "credentials",
  initialState: {
    signedIn: false,
    email_id: "",
    user_id: "",
    status: "inactive",
    stripe_cus_id: "",
    login_type: "",
    selectedPlan: "",
    //=========================
    cancelTokenSource: null,
    apiRequests: {},
  },

  reducers: {
    signIn: (state, action) => {
      const user_data = action?.payload?.success?.user_data;
      state.signedIn = true;
      state.email_id = user_data?.email;
      state.user_id = user_data?.user_id;
      state.status = user_data?.status;
      state.stripe_cus_id = user_data?.stripe_cus_id;
      state.login_type = user_data?.login_type;
      state.selectedPlan = user_data?.plan_name;
    },

    loginDetails: (state, action) => {
      const user_data = action?.payload?.success?.user_data;
      state.selectedPlan = user_data?.plan_name;
    },

    toggleSidebar: (state) => {
      state.sidebar = !state.sidebar;
    },

    //==============================================================================
    setCancelTokenSource: (state, action) => {
      state.cancelTokenSource = action.payload;
    },
    setApiRequest: (state, action) => {
      state.apiRequests = state.apiRequests || {}; // Initialize apiRequests if it's undefined
      const cancelToken001 = action.payload?.cancelToken001;
      state.apiRequests[action.payload?.requestId] = { cancelToken001 };
    },
  },
});

export const {
  signIn,
  toggleSidebar,
  loginDetails,
  setApiRequest,
  setCancelTokenSource,
} = slice.actions;
export default slice.reducer;

export const registerNewUserApiCallWeb = (data) =>
  apiCallBegan({
    url: `/users`,
    method: "post",
    data: {
      email_id: data.email,
      password: data.password,
    },
    onSuccess: [data.callbackNewUserApiCallWeb],
    fieldId: "signup",
  });

export const loginUserApiCallWeb = (
  email_id,
  password,
  callback,
  callbackErrorOnLogin
) =>
  apiCallBegan({
    url: `/users/login`,
    method: "post",
    data: {
      email_id: email_id,
      password: password,
    },
    onSuccess: [signIn.type, callback],
    onError: [callbackErrorOnLogin],
    fieldId: "signin",
  });

export const loginUserApiCallGoogle = (email_id, callback) =>
  apiCallBegan({
    url: `/users/google`,
    method: "post",
    data: {
      email_id: email_id,
    },
    onSuccess: [signIn.type, callback],
    fieldId: "signin",
  });

export const loginDetailsApiCall = () => {
  return apiCallBegan({
    url: `/users/logindetails`,
    method: "post",
    onSuccess: [loginDetails.type],
  });
};

export const reSendVerifyEmail = (data) => {
  return apiCallBegan({
    url: `/users/resend-verify-email`,
    method: "post",
    data: { email: data?.email },
    onSuccess: [data?.callbackOnResendEmail],
    onError: [data?.callbackErrorOnResendEmail],
    fieldId: data.fieldId,
  });
};

export const verifyUser = (data) => {
  return apiCallBegan({
    url: `/users/verify`,
    method: "post",
    data: { token: data?.token },
    onSuccess: [signIn.type, data?.callback],
    onError: [data?.callbackError],
  });
};

export const resetUserApiCall = (email_id, callback, callbackErrorOnReset) =>
  apiCallBegan({
    url: `/users/reset`,
    method: "post",
    data: {
      email_id: email_id,
    },
    onSuccess: [callback],
    onError: [callbackErrorOnReset],
    fieldId: "reset",
  });

export const reSendResetEmail = (data) => {
  return apiCallBegan({
    url: `/users/resend-reset-email`,
    method: "post",
    data: { email: data?.email },
    onSuccess: [data?.callbackOnResendEmail],
    onError: [data?.callbackErrorOnResendEmail],
    fieldId: data.fieldId,
  });
};

export const verifyResetPasswordLink = (data) => {
  return apiCallBegan({
    url: `/users/verify-reset-password-link`,
    method: "post",
    data: { token: data?.token },
    onSuccess: [data?.callbackOnVerifyResetPasswordLink],
    onError: [data?.callbackErrorOnVerifyResetPasswordLink],
  });
};

export const resetPassword = (data) => {
  return apiCallBegan({
    url: `/users/reset-password`,
    method: "post",
    data: { token: data?.token, password: data?.password },
    onSuccess: [data?.callback],
    onError: [data?.callbackErrorOnReset],
  });
};

export const cancelApi = ({ requestId, callback, callbackError }) =>
  apiCallBegan({
    url: `/cancel`,
    method: "post",
    data: {
      requestId,
    },
    onSuccess: [callback],
    onError: [callbackError],
  });

export const changePassword = ({ password, newPassword, callback }) =>
  apiCallBegan({
    url: `/users/change-password`,
    method: "post",
    data: {
      password,
      newPassword,
    },
    onSuccess: [callback],
  });
