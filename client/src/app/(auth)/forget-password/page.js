import React from "react";
import ForgetPassword from "../../../components/auth/forget-password/page";
import { config } from "../../../../config";

export const metadata = {
  title: config.seo.auth.forgot_password.title,
};

const Page = () => {
  return <ForgetPassword />;
};

export default Page;
