import React from "react";
import PaymentSuccess from "@/components/payment/payment-success/page";
import { config } from "../../../../config";

export const metadata = {
  title: config.seo.payment.payment_success.title,
};

const Page = () => {
  return <PaymentSuccess />;
};

export default Page;
