"use client";

import React from "react";
import { getRoutes } from "../../routes";
import { config } from "../../../config";
import Image from "next/legacy/image";
import Link from "next/link";
import getLightDarkValue from "@/libs/theme/page";

const FooterVisitor = () => {
  const routes = getRoutes("visitor");
  const footer = [
    {
      heading: "LEGAL",
      array: [
        { name: "Terms of services", path: "" },
        { name: "Privacy policy", path: "" },
      ],
    },
    { heading: "TEMPLATES", array: [{ name: "AI logics", path: "" }] },
    { heading: "LINKS", array: routes },
  ];
  const imgClass = getLightDarkValue("img-light", "img-dark");

  return (
    <div className="visitor-footer row ">
      <div className="col-3">
        <div className="copyright">
          <Link href="/">
            <Image
              src={`/images/${config.logo}`}
              alt="logo image"
              className={`logo ${imgClass}`}
              width={200}
              height={40}
            />{" "}
          </Link>
          <p className="mb-0">
            Ship your startup in days, not weeks Copyright © 2024 - All rights
            reserved
          </p>
        </div>
      </div>

      {footer?.map((f, i) => {
        return (
          <div key={i} className="col-3">
            <div className="tabs d-flex flex-column align-items-start">
              <p className="heading">{f.heading}</p>
              {f.array?.map((a, i) => {
                return (
                  <Link href={a?.path ?? "/"}>
                    <div key={i} className="array">
                      <p>{a.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FooterVisitor;
