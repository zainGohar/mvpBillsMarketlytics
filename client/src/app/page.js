import React from "react";
import Home from "@/components/home/page";
import { config } from "../../config";

export const metadata = {
  title: config.seo.home.title,
};

const Main = () => {
  return <Home />;
};

export default Main;
