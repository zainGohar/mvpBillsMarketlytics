"use client";

import React, { useEffect } from "react";
import Admin from "./admin";
import Visitor from "./visitor";
import { useSelector } from "react-redux";
import { getOrCreateMachineId } from "@/libs/common";

const MainDrawr = ({ children }) => {
  const signed_in = useSelector(
    (state) => state?.entities?.credentials?.signedIn
  );

  useEffect(() => {
    getOrCreateMachineId();
    const theme = localStorage.getItem("theme");
    document.body.setAttribute("data-theme", theme);
    window.dispatchEvent(new Event("themeChange"));
  }, []);

  return signed_in ? (
    <Admin children={children} />
  ) : (
    <Visitor children={children} />
  );
};

export default MainDrawr;
