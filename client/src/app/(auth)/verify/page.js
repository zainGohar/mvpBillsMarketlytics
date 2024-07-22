import React from "react";
import Verify from "../../../components/auth/verify/page";
import { config } from "../../../../config";

export const metadata = {
  title: config.seo.auth.verify.title,
};

const Page = () => {
  return <Verify />;
};

export default Page;
