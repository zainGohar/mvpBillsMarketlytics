"use client";
import React, { useState, useEffect } from "react";
import Button from "@/libs/button/page";
import { useDispatch } from "react-redux";
import { reSendVerifyEmail } from "@/store/credentials";
import { SpinnerLoader } from "@/libs/Loader";

const Verifymail = () => {
  const email = sessionStorage.getItem(`email`);

  const [disabled, setDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [content, setContent] = useState({
    logo: "bi bi-envelope-at ",
    heading: "Verify your email",
    content: `We've sent an email to ${email}. Please verify your email address and
    activate your account.`,
  });

  const changeLogo = (newLogo) => {
    setContent((prevContent) => ({
      ...prevContent,
      logo: newLogo,
    }));
  };

  const changeheading = (newHeading) => {
    setContent((prevContent) => ({
      ...prevContent,
      heading: newHeading,
    }));
  };

  const changeContent = (newContent) => {
    setContent((prevContent) => ({
      ...prevContent,
      content: newContent,
    }));
  };

  const dispatch = useDispatch();

  const callbackOnResendEmail = (response) => {
    try {
      changeLogo("bi bi-check-circle text-success");
      changeheading(response?.message?.content);
      changeContent(`We have send an email to ${email}.\nPlease Check!`);

      setDisabled(true);
      setCountdown(60); // Set the countdown time (in seconds)
    } catch (error) {
      setDisabled(false);
    }
  };

  const callbackErrorOnResendEmail = (response) => {
    try {
      changeLogo("bi bi-exclamation-triangle text-danger");
      changeheading(response?.data?.message?.content);
      changeContent("");
      if (response.status === 400) {
        setDisabled(true);
        setCountdown(60);
      }
    } catch (error) {
      setDisabled(false);
    }
  };

  const handleResend = () => {
    try {
      dispatch(
        reSendVerifyEmail({
          email,
          callbackOnResendEmail,
          callbackErrorOnResendEmail,
          fieldId: "verify-mail-loader",
        })
      );
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setDisabled(false);
    }
  }, [countdown]);

  if (email) {
    return (
      <div className="d-flex justify-content-center">
        <div className="d-flex justify-content-center align-items-center card card-box">
          <div>
            <div className=" rounded py-3 px-5 position-relative">
              <SpinnerLoader id="verify-mail-loader" />

              <div className=" d-flex flex-column align-items-center justify-content-center">
                <div style={{ fontSize: "60px" }} className={content?.logo} />
                <span style={{ fontSize: "30px" }}>{content?.heading}</span>

                <p className="text-center  my-3">{content?.content}</p>

                <div
                  className="w-100 d-flex justify-content-start mt-2"
                  style={{ fontSize: "14px" }}
                >
                  {countdown === 0 && (
                    <p className="mb-0 d-flex ps-3 align-items-center">
                      <p className="mb-0" style={{ opacity: "80%" }}>
                        Don&apos;t receive an email?&nbsp;&nbsp;
                      </p>
                      <Button
                        borderBottom="1px solid #64e5ff"
                        text="Resend Email"
                        className="simple-button text-primary p-0 bg-transparent rounded-0"
                        onClick={handleResend}
                        disabled={disabled}
                      />
                    </p>
                  )}

                  {countdown > 0 && (
                    <span className="ms-2 " style={{ color: "#64e5ff" }}>
                      {" "}
                      Resend in{" "}
                      {Math.floor(countdown / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(countdown % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="d-flex justify-content-center ">
        <div className="d-flex justify-content-center align-items-center card card-box">
          <div>
            <div className=" rounded d-flex flex-column align-items-center justify-content-center py-3 px-5">
              <div
                style={{ fontSize: "60px" }}
                className="bi bi-exclamation-triangle text-danger"
              />
              <span style={{ fontSize: "30px" }}>Ooops, Invalid URL!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Verifymail;
