import React from "react";
import Signup from "@/components/auth/signup/page";
import { config } from "../../../../config";

export const metadata = {
  title: config.seo.auth.signup.title,
};
const Page = () => {
  return <Signup />;
};

export default Page;
