"use client";

import Button from "@/libs/button/page";
import { handleSelectPlan } from "@/libs/common";
import Image from "next/legacy/image";
import Link from "next/link";
import React, { useState } from "react";
import { config } from "../../../config";
import { useDispatch } from "react-redux";
import getLightDarkValue from "@/libs/theme/page";
import { home } from "./object";

const Visitor = () => {
  const dispatch = useDispatch();
  const [way, setWay] = useState("email");
  const [duration, setduration] = useState("month");

  const handleSetEasyWay = (value) => {
    setWay(value);
  };
  let content = home.easyWay?.find((l) => l.id == way);

  const section_1_img = getLightDarkValue(
    "/images/home/section-1/section-1-light.png",
    "/images/home/section-1/section-1-dark.png"
  );

  const subType = [
    { value: "month", name: "Monthly" },
    { value: "year", name: "Yearly" },
  ];
  const sunFocus = (value) => {
    setduration(value);
  };
  const style = {
    backgroundColor: "white",
    color: "#0056fd",
    transition: "all 0.2s ease-in-out",
  };

  return (
    <div className="home">
      <section className="section-1 mt-5 row">
        <div className="col-12 col-sm-6 content">
          <h1 className="heading">
            Ship your startup & ship<mark className="py-0"> it fast</mark>
          </h1>
          <p className="mb-0 text">
            The NextJS boilerplate with all you need to build your SaaS, AI
            tool, or any other web app and make your first $ online fast.
          </p>
          <Button
            width="100%"
            icon="bi bi-flash"
            text="Lets start building"
            className="simple-button"
          />
          <p className="offer">
            <i className="bi bi-box icon" />
            <span> 50% off</span> for first 100 devs & 80% off for students
            until April 30th
          </p>
        </div>
        <div className="ccol-12 col-sm-6 image-box">
          <Image
            layout="fill"
            objectFit="contain"
            src={section_1_img}
            alt="section-1"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="col-12 journey">
          <div className="w-100 current-journey">
            <h3 className="mb-5">Your current journey to build SaaS app 👇</h3>
            <div className="mapWrapper">
              {home?.currentJourney?.map((j, i) => {
                return (
                  <div className="row" key={i}>
                    {j?.rows?.map((r, i) => {
                      return (
                        <div className="itemBar" key={i}>
                          <div className="itemInfo">
                            {r.direction == "rtl" && (
                              <i className="mt-1 bi bi-heart-arrow reverse me-2" />
                            )}
                            <p className="mb-0">{r.item_info}</p>&nbsp;&nbsp;
                            {r.direction == "ltr" && (
                              <i className="bi bi-heart-arrow" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-100 shipgpt-journey">
            <h3 className="mb-5">Your Journey with ShipGPT</h3>
            <div className="mapWrapper">
              {home?.shipgptJourney?.map((j, i) => {
                return (
                  <div className="row" key={i}>
                    {j?.rows?.map((r, i) => {
                      return (
                        <div className="itemBar" key={i}>
                          <div className="itemInfo">
                            {r.direction == "rtl" && (
                              <i className="mt-1 bi bi-heart-arrow reverse me-2" />
                            )}
                            <p className="mb-0">{r.item_info}</p>&nbsp;&nbsp;
                            {r.direction == "ltr" && (
                              <i className="bi bi-heart-arrow" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section className="section-2">
        <div className="save-time">
          <p>
            <span>
              Spent <strong>4 hours</strong> configuring emails
            </span>
            <br />
            <span>
              Dedicated <strong>6 hours</strong> to the design of a landing page
            </span>
            <br />
            <span>
              Allocated <strong>4 hours</strong> for managing Stripe webhooks
            </span>
            <br />
            <span>
              Invested <strong>2 hours</strong> in SEO tags
            </span>
            <br />
            <span>
              Used <strong>1 hour</strong> to apply for Google Oauth
            </span>
            <br />
            <span>
              Took <strong>3 hours</strong> to set up DNS records
            </span>
            <br />
            <span>
              Required <strong>2 hours</strong> to secure API routes
            </span>
            <br />
            <span>Countless hours spent in overthinking...</span>
          </p>

          <h4>
            = <span>22+ hours</span> of headaches{" "}
            <i className="bi bi-cloud-drizzle" />
          </h4>
        </div>
      </section>
      <section className="section-7 text-center">
        <div>
          <h2 className="mb-0 ">
            We have a tutorial series to help you build your SaaS app step by
            step.
          </h2>
          <Link href="https://shipgpt.ai/tutorials/">
            <p className="bi bi-arrow-right link">
              &nbsp;&nbsp;Start Tutorial Series
            </p>
          </Link>
        </div>
      </section>
      <section className="section-6 mb-4">
        <div className="container">
          <h3 className="mb-4">
            We have already launched following products using this template
          </h3>
          <div className="products d-block d-sm-flex w-100 justify-content-between mt-5">
            <Link href={"https://chatdox.com/"}>
              <p>ChatDox AI</p>
            </Link>
            <span>|</span>
            <Link href={"https://chatwebby.com/"}>
              <p>ChatWebby AI</p>
            </Link>
            <span>|</span>
            <Link href={"https://recaster.ai/"}>
              <p>Recaster AI</p>
            </Link>
            <span>|</span>
            <Link href={"https://shipgpt.ai/"}>
              <p>ShipGPT AI </p>
            </Link>
          </div>
        </div>
      </section>
      <section className="section-3">
        <div className="box">
          <p className="easy-way">
            <i className="bi bi-arrow-down icon" />
            There's an easier way
          </p>
          <h2>
            Get a bug-free Next.js template with essential features for your
            SaaS, ready in minutes.
          </h2>
          <p className="text">
            Authenticate users, handle transactions, and dispatch emails in a
            flash. Devote your energy to growing your startup, not wrestling
            with APIs. ShipSaas equips you with the essential code templates for
            a swift launch.
          </p>
          <div className="way-group">
            {home.easyWay?.map((e, i) => {
              return (
                <div key={i} className="ways">
                  <p
                    className={`button mb-0 ${e.id == way && "active"}`}
                    onClick={() => handleSetEasyWay(e.id)}
                  >
                    <i className={e.icon} />
                    <span>{e.name}</span>
                  </p>
                </div>
              );
            })}
            <div className="content">
              <h6>{content.content.name}</h6>
              <div className="list">
                {content.content.list?.map((l, i) => {
                  return (
                    <div key={i} className={`d-flex ${l.active && "active"}`}>
                      <i className={l.icon} />
                      <span>{l.value}</span>
                    </div>
                  );
                })}
              </div>
              <div className="to">
                <span>{content.content?.comapny?.text}</span>
                <Link href={content.content?.comapny?.to ?? "/"}>
                  {content.content?.comapny?.link}
                </Link>
              </div>
            </div>
            <div className="bg-content" />
          </div>
        </div>
      </section>
      <section className="section-4 pb-5 pt-4">
        <h2 className="mb-4">Lets have a Video Demo</h2>
        <div className="video-box"></div>
        <p className="mt-4 mb-0">
          Not Satisfied? Book a demo with us: <Link href={"/"}>link</Link>
        </p>
      </section>
      <section className="section-8">
        <div className="container">
          <h2 className="mb-5 text-center">
            Not just another boilerplate, it includes
          </h2>
          <table>
            <tbody>
              {home?.planIncludes?.map((p, i) => {
                return (
                  <tr key={i}>
                    {p?.tr?.map((t, i) => {
                      return (
                        <td key={i}>
                          {t?.value && (
                            <i className="bi text-success bi-check2-all me-2" />
                          )}
                          {t?.value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section-5">
        <p className="pricing-title">Pricing</p>
        <h3>Cut coding hours, launch quickly, earn profits!</h3>
        <p className="offer">
          <i className="bi bi-box icon" />
          <span> 50% off</span> for first 100 devs & 80% off for students until
          April 30th
        </p>

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

        <div className="pricing-box mt-3">
          {config.stripe.plans
            ?.filter(
              (f) => f.planDisplayName !== "FREE" && f?.duration === duration
            )
            ?.map((plan, i) => {
              return (
                <div
                  key={i}
                  className={`pricing-card ${plan.recommended && "active"}`}
                >
                  <p className="plan-display-name mb-0">
                    {plan.planDisplayName}
                  </p>
                  <h3 className="price pt-3 pb-0">
                    ${plan.price}
                    <span>USD</span>
                  </h3>
                  <div className="list">
                    {plan.features?.map((f, i) => {
                      return (
                        <p key={i} className="my-2">
                          <i className={"bi bi-check"} />
                          <span>{f}</span>
                        </p>
                      );
                    })}
                  </div>

                  <div className="button-box d-flex w-100 mt-3 flex-column align-items-center">
                    <Button
                      width="100%"
                      icon="bi bi-flash"
                      text="Lets start building"
                      className="simple-button"
                      onClick={() =>
                        handleSelectPlan(
                          dispatch,
                          plan.stripePriceId,
                          "subscription",
                          plan.planName
                        )
                      }
                    />
                    <p className="bottom-line mt-2 mb-0">
                      Pay once. Build unlimited projects!
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default Visitor;
