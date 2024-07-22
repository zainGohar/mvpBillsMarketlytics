import React from "react";
import Roadmap from "@/components/roadmap/page";
import { config } from "../../../config";

export const metadata = {
  title: config.seo.roadmap.title,
};

const Page = () => {
  return <Roadmap />;
};

export default Page;
