import { combineReducers } from "redux";
import credentials from "./credentials";
import loader from "./loaderReducer";
import error from "./error";
import alert from "./alert";
import mainSlice from "./mainSlice";
import aiFileStructure from "./aiFileStructure";
export default combineReducers({
  credentials: credentials,
  loader: loader,
  error: error,
  alert: alert,
  mainSlice: mainSlice,
  aliFileStructure: aiFileStructure,
});
