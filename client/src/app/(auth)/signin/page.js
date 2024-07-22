import React from "react";
import SignIn from "@/components/auth/signin/page";
import { config } from "../../../../config";

export const metadata = {
  title: config.seo.auth.signin.title,
};

const Page = () => {
  return <SignIn />;
};

export default Page;
