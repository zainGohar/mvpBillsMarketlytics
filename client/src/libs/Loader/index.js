"use client";

import React from "react";
import { useSelector } from "react-redux";
import styles from "./Loader.module.scss";
import Image from "next/legacy/image";
import { config } from "../../../config";

export function AppLoader() {
  return (
    <div className={styles["loaderContainer"]}>
      <div
        className={`${styles["Loader"]} d-flex justify-centent-center align-items-center`}
      >
        <Image
          src={`/images/${config.icon}`}
          alt="...Loading"
          width="100"
          height="100"
        />
      </div>
    </div>
  );
}

export function BtnLoader(props) {
  const { position, pR } = props;
  return (
    <>
      <div
        className={`d-flex  justify-content-${position} ${
          position == "end" && `pe-${!pR ? "3" : pR}`
        } align-items-center w-100 h-100 `}
        style={{
          zIndex: "1080",
        }}
      >
        <div className={styles["dot-flashing"]} />
      </div>
    </>
  );
}

export function BtnLoaderSimple(props) {
  const { status, position, loadingValue } = props;
  if (status) {
    return (
      <>
        <div
          className={`position-absolute d-flex justify-content-${position} ${
            position == "end" && "pe-4"
          } align-items-center w-100 h-100`}
        >
          {loadingValue ? (
            loadingValue + "%"
          ) : (
            <div className={styles["dot-flashing"]} />
          )}
        </div>
      </>
    );
  } else return null;
}

export function SpinnerLoader(props) {
  const loader = useSelector((state) => state.entities?.loader);
  const id = props && props?.id;
  if (loader && id && loader[id]) {
    return (
      <>
        <div className="position-absolute w-100 h-100 verify-loading rounded">
          <div className={`${styles["lds-facebook"]}`}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </>
    );
  } else return <div></div>;
}

export const LoadingDots = () => {
  return (
    <span className={styles["loading-dots"]}>
      <span />
      <span />
      <span />
    </span>
  );
};
