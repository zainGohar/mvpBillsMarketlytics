"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ViewPoint } from "@/libs/common";
import ApiFrontend from "@/libs/apiFrontend";
import { config } from "../../../../config";

const PaymentSuccess = () => {
  const [response, setResponse] = useState(null);
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  useEffect(() => {
    const getPaymentSuccessData = async () => {
      try {
        const response = await ApiFrontend({
          url: "payment/payment-success",
          method: "POST",
          data: { session_id },
        });
        setResponse(response?.success);
      } catch (error) {
        console.log("error", error);
      }
    };

    // Call the async function when the component mounts
    getPaymentSuccessData();
  }, []);

  const view = ViewPoint("1300px");

  return (
    <div className="payment-verified-container">
      <div className="row payment-verified rounded">
        <div
          className={`${
            !view ? "col-12" : "col-6"
          } payment d-flex flex-column justify-content-center align-items-center`}
        >
          <div className="d-flex company w-100">
            <i className="bi bi-shop-window " />
            <span className="mx-3">{config.url}</span>
          </div>
          <div className="subscription-type w-100">
            <p>{response?.object?.invoiceHeadingLine}</p>
            <div className="price-box">
              <span className="price">${response?.object?.amount}</span>
              <span className="duration">
                {response?.object?.invoiceDuration}
              </span>
            </div>
            <div className="billed-box rounded px-2 py-2">
              <div className="d-flex justify-content-between ">
                <span>{response?.object?.itemName}</span>
                <span>${response?.object?.amount}</span>
              </div>
              <span>{response?.object?.itemDurationDescription}</span>
            </div>
            <div className="mx-1">
              <div className="d-flex justify-content-between sub-box">
                <span>Subtotal</span>
                <span>${response?.object?.amount}</span>
              </div>
              <div className="border-line w-100" />
              <div className="d-flex justify-content-between total-box">
                <span>Total paid today</span>
                <span>${response?.object?.amount}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${
            !view ? "col-12" : "col-6"
          } thanks d-flex flex-column justify-content-center align-items-center position-relative`}
        >
          <span className="bi bi-check2-circle text-success check-icon" />
          <p className="Thanks-head">{response?.object?.descriptionHeading}</p>
          <div className="position-relative thanks-bottom-box rounded w-100">
            <p className="thanks-bottom">
              <span class="descripcion">WWW.{config.url}</span>
              <span class="price">${response?.object?.amount}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
