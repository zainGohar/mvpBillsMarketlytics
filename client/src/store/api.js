import { createAction } from "@reduxjs/toolkit";

export const apiCallBegan = createAction("apiCallBegan");
export const apiCallSuccess = createAction("apiCallSuccess");
export const apiCallFailed = createAction("apiCallFailed");

import React from "react";

export default function api() {
  return <div></div>;
}
