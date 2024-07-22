"use client";

import React from "react";
import Button from "@/libs/button/page";
import { useDispatch, useSelector } from "react-redux";
import { handleSelectPlan } from "@/libs/common";

export const PricingCard = ({ plan, priceColor, key }) => {
  const dispatch = useDispatch();

  const selectedPlan = useSelector(
    (state) => state.entities.credentials?.selectedPlan
  );
  const isSelected = plan.planName !== selectedPlan;

  return (
    <div
      key={key}
      id="pricing-plan-home"
      className={`card my-3 p-0 mx-3 pricing-card border-none ${plan.planDisplayName}`}
      style={{
        height: "28rem",
      }}
    >
      <div
        style={{
          backgroundColor: "inherit",
        }}
        className="card-header px-4 py-sm-3 py-1 d-flex justify-content-between align-items-center"
      >
        <span>
          {plan.recommended && <span className="reco">{plan.recommended}</span>}
          {plan.planDisplayName}
        </span>
        <h3 style={{ color: priceColor }}>
          ${plan.price}
          {plan.planName !== "free" && `/${plan.duration}`}
        </h3>
      </div>
      <div className="card-body text-center d-flex flex-column align-items-start px-4 pb-3 pt-3">
        {plan.features.map((feature, i) => (
          <span key={i} className="card-text text-center w-100 py-2">
            {feature}
          </span>
        ))}
        {plan.planDisplayName != "FREE" && (
          <Button
            alerttitle="Update Plan"
            alertdescription="Do you want to update plan?"
            alert={plan.planName !== "free" ? true : false}
            classNameMain="px-0 mt-3 w-100"
            className="simple-button animation "
            text={isSelected ? "Upgdrade now!" : "Selected Plan"}
            onClick={() =>
              handleSelectPlan(
                dispatch,
                plan.stripePriceId,
                "subscription",
                plan.planName
              )
            }
            style={
              !isSelected
                ? { opacity: "50%", cursor: "text" }
                : { opacity: "100%", cursor: "pointer" }
            }
            id={plan.planName}
            disabled={!isSelected}
          />
        )}
      </div>
    </div>
  );
};
