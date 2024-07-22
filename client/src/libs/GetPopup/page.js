import React from "react";
import styles from "@/libs/GetPopup/Popup.module.scss";

export default function Callout(props) {
  const { errorContent, width, display, left, ref } = props;

  return (
    <div>
      <div ref={ref} className={styles["popup"]}>
        <div
          style={{
            width: width,
            display: display,
            marginLeft: left,
          }}
          className={styles["popuptext"]}
        >
          {errorContent}
        </div>
      </div>
    </div>
  );
}
