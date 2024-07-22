import React from "react";
import ResetPassword from "../../../components/auth/reset-password/page";
import { config } from "../../../../config";

export const metadata = {
  title: config.seo.auth.reset_password.title,
};

const Page = () => {
  return <ResetPassword />;
};

export default Page;
