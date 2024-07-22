"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { verifyUser, reSendVerifyEmail } from "@/store/credentials";
import Button from "@/libs/button/page";
import { AppLoader } from "@/libs/Loader";
import { SpinnerLoader } from "@/libs/Loader/index";

export default function Verify() {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState({});
  const [disabled, setDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");

  const [content, setContent] = useState({
    logo: "",
    heading: "",
    content: "",
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const callback = () => {
    router.push("/");
  };

  const callbackError = (response) => {
    setLoading(false);
    setResponse(response);
    setEmail(response?.data?.error?.email);

    if (response?.status === 410) {
      changeLogo("bi bi-envelope-exclamation text-danger");
      changeContent(
        "It seems that the verification process for your account has timed out and is no longer valid"
      );
    } else changeLogo("bi bi-exclamation-triangle text-danger");

    changeheading(response?.data?.message?.content);
  };

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) dispatch(verifyUser({ token, callback, callbackError }));
  }, [token]);

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

  const callbackOnResendEmail = (response) => {
    try {
      changeLogo("bi bi-check-circle text-success");
      changeheading(response?.message?.content);
      changeContent(`We have send an email to ${email}.\nPlease Check!`);

      setDisabled(true);
      setCountdown(60); // Set the countdown time (in seconds)
    } catch (error) {
      console.error("Error sending email:", error);
      setDisabled(false);
    }
  };

  const callbackErrorOnResendEmail = (response) => {
    changeLogo("bi bi-exclamation-triangle text-danger");
    changeheading(response?.data?.message?.content);
    changeContent("");
  };

  const handleResend = () => {
    try {
      dispatch(
        reSendVerifyEmail({
          email,
          callbackOnResendEmail,
          callbackErrorOnResendEmail,
          fieldId: "verify-loader",
        })
      );
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  if (loading) {
    return <AppLoader />;
  } else {
    return (
      <div className="d-flex justify-content-center">
        <div className="d-flex justify-content-center align-items-center card card-box">
          <div>
            <div className="border-box rounded d-flex flex-column align-items-center justify-content-center py-3 px-5">
              <SpinnerLoader id="verify-loader" />
              <div className="d-flex flex-column align-items-center justify-content-center">
                <div style={{ fontSize: "60px" }} className={content?.logo} />
                <span style={{ fontSize: "30px" }}>{content?.heading}</span>

                {response?.status === 410 && (
                  <>
                    <p className="text-center  my-3"> {content?.content} </p>

                    <div
                      className="w-100 d-flex justify-content-start mt-2"
                      style={{ fontSize: "14px" }}
                    >
                      {countdown === 0 && (
                        <p className="mb-0 d-flex ps-3 align-items-center">
                          <Button
                            borderBottom="1px solid #64e5ff"
                            text="Click here"
                            className="simple-button text-primary p-0 bg-transparent rounded-0"
                            onClick={handleResend}
                            disabled={disabled}
                          />
                          <p className=" mb-0" style={{ opacity: "80%" }}>
                            &nbsp;&nbsp;to resend email
                          </p>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
