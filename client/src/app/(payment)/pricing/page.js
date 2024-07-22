import React from "react";

import Pricing from "@/components/payment/pricing/page";
import { config } from "../../../../config";

export const metadata = {
  title: config.seo.payment.pricing.title,
};

const Page = () => {
  return <Pricing />;
};

export default Page;
