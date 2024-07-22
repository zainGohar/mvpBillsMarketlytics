import React from "react";
import Verifymail from "../../../components/auth/verifymail/page";
import { config } from "../../../../config";

export const metadata = {
  title: config.seo.auth.verifymail.title,
};

const Page = () => {
  return <Verifymail />;
};

export default Page;
