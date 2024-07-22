import { createAsyncThunk } from "@reduxjs/toolkit";

// errorTypes.js
export const SET_ERROR = "SET_ERROR";
export const HIDE_ERROR = "HIDE_ERROR";
export const REMOVE_ERROR = "REMOVE_ERROR";

// errorActions.js
function setErrors(error) {
  return {
    type: SET_ERROR,
    error: error,
  };
}

export function removeErrors(keyVal) {
  return {
    type: REMOVE_ERROR,
    keyVal: keyVal,
  };
}

export function hideError() {
  return {
    type: HIDE_ERROR,
  };
}

const initState = {
  error: null,
};

export default function error(state = initState, action) {
  if (action?.payload && action.payload?.error) {
    return {
      error: { error: action.payload.message },
    };
  } else if (action.type === HIDE_ERROR) {
    return {
      error: null,
    };
  } else if (action.type === SET_ERROR) {
    return {
      ...state,
      ...setNullIfObjectIsEmpty(action.error),
    };
  } else if (action.type === REMOVE_ERROR) {
    if (state != null && action?.keyVal) {
      const { [action.keyVal]: tmp, ...rest } = state;
      return rest;
    }
    return state;
  }

  return state;
}

const setNullIfObjectIsEmpty = (val) => {
  if (val && Object.keys(val).length === 0) return null;
  return val;
};

const ifExistTurnFocusToScrollOnSepecificErrorFalse = (obj) => {
  for (var k in obj) {
    if (obj[k] instanceof Object) {
      ifExistTurnFocusToScrollOnSepecificErrorFalse(obj[k]);
    } else {
      if (k === "focus") obj[k] = false;
    }
  }
};

export const setError = createAsyncThunk(
  "errors/setError",
  async (data, { dispatch }) => {
    try {
      await dispatch(setErrors(JSON.parse(JSON.stringify(data))));
      ifExistTurnFocusToScrollOnSepecificErrorFalse(data);
    } catch (error) {
      console.log(error);
    }
  }
);
