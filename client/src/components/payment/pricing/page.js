"use client";

import React, { useState } from "react";
import Button from "@/libs/button/page";
import { useSelector } from "react-redux";
import { ViewPoint } from "@/libs/common";
import { config } from "../../../../config";
import { PricingCard } from "./pricingCard";

const Pricing = () => {
  const [duration, setduration] = useState("month");

  const view = ViewPoint("600px");
  const style = {
    backgroundColor: "white",
    color: "#0056fd",
    transition: "all 0.2s ease-in-out",
  };
  const subType = [
    { value: "month", name: "Monthly" },
    { value: "year", name: "Yearly (-10%)" },
  ];
  const sunFocus = (value) => {
    setduration(value);
  };
  return (
    <div className="pricing-styles">
      <div className="toggle-button-pricing">
        {subType?.map((s, i) => {
          return (
            <span
              key={i}
              onClick={() => sunFocus(s.value)}
              style={duration == s.value ? style : null}
            >
              {s.name}
            </span>
          );
        })}
      </div>

      <div className="plans-container">
        {config?.stripe?.plans
          ?.filter((p) => p?.duration === duration || p.planName === "free")
          ?.map((p, i) => (
            <div key={p.planName} className="pricing-card">
              <PricingCard
                priceColor="#0056fd"
                backgroundColor="white"
                color="black"
                plan={p}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Pricing;
