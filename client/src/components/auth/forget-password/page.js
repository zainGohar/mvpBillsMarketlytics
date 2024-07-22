"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { validateFunc, validateProperty } from "@/libs/Validation";
import { hideError, setError, removeErrors } from "@/store/error";
import Image from "next/legacy/image";
import { resetUserApiCall, reSendResetEmail } from "@/store/credentials";
import { Input } from "@/libs/input";
import Button from "@/libs/button/page";
import { SpinnerLoader } from "@/libs/Loader/index";
import { config } from "../../../../config";

export default function ForgetPassword() {
  const dispatch = useDispatch();
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");
  const [state, setState] = useState({
    type: "resetPassword",
    logo: "",
    heading: "Reset your password",
    content: `Enter the email address associated with your account and we'll send you a link to reset your password.`,
  });

  const onValueChanged = async (e) => {
    const name = e.target.id;
    const value = e.target.value.toLowerCase();
    const errors = await validateProperty(name, value);
    if (errors) {
      dispatch(setError(errors));
    } else {
      dispatch(removeErrors(name));
    }
  };

  useEffect(() => {
    dispatch(hideError());
  }, []);

  const callback = (response) => {
    setState({
      type: "emailSent",
      logo: "bi bi-check-circle text-success",
      heading: "Check your email",
      content: `Thanks! We've sent an email to ${response?.success?.email_id} containing further instructions for resetting your password.`,
    });
    setCountdown(60); // Set the countdown time (in seconds)
  };

  const callbackErrorOnReset = (response) => {
    if (response.status === 410) {
      setState({
        type: "resend",
        logo: "bi bi-exclamation-triangle text-danger",
        heading: "Error",
        content: response?.data?.message?.content,
      });
      setCountdown(60);
      return;
    }

    setState({
      type: "Failiure",
      logo: "bi bi-exclamation-triangle text-danger",
      heading: "Error",
      content: response?.data?.message?.content,
    });
  };

  const reset = async (event) => {
    event.preventDefault();

    const email = event.target.email_id.value
      ? event.target.email_id.value.toLowerCase()
      : null;

    setEmail(email);

    const data = {
      [event.target.email_id.name]: email,
    };
    const errors = await validateFunc(data, "forgetpassword");

    if (errors) {
      dispatch(setError(errors));
    } else {
      dispatch(hideError(errors));
      await dispatch(resetUserApiCall(email, callback, callbackErrorOnReset));
    }
  };

  const callbackOnResendEmail = (response) => {
    try {
      setState({
        type: "resend",
        logo: "bi bi-check-circle text-success",
        heading: "Check your email",
        content: `Thanks! We've re-sent an email to ${email} containing further instructions for resetting your password.`,
      });

      setCountdown(60); // Set the countdown time (in seconds)
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const callbackErrorOnResendEmail = (response) => {
    try {
      if (response.status === 410) {
        setState({
          type: "resend",
          logo: "bi bi-exclamation-triangle text-danger",
          heading: "Error",
          content: response?.data?.message?.content,
        });
        setCountdown(60);
        return;
      }

      setState({
        type: "Failiure",
        logo: "bi bi-exclamation-triangle text-danger",
        heading: "Error",
        content: response?.data?.message?.content,
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const resend = () => {
    try {
      dispatch(
        reSendResetEmail({
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

  const setNewMail = () => {
    setState({
      type: "resetPassword",
      logo: "",
      heading: "Reset your password",
      content: `Enter the email address associated with your account and we'll send you a link to reset your password.`,
    });
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [countdown]);

  return (
    <div className={`d-flex justify-content-center align-items-center signin`}>
      <SpinnerLoader id="reset-loader" />

      <div
        className={`box   container  d-flex flex-column justify-content-center `}
      >
        {/* this div is used to show logo*/}
        <div className={"logo"}>
          <Image
            src={`/images/${config.icon}`}
            alt="logo image"
            className="img-fluid"
            width="80"
            height="80"
          />
        </div>

        <div style={{ fontSize: "60px" }} className={state?.logo} />

        <div className={"heading"}>
          <p className="text my-3">{state?.heading}</p>
        </div>

        <div className={"sub-heading d-flex justify-content-center"}>
          <p className="w-75 mb-0">{state?.content}</p>
        </div>

        <div className={"sub-heading"}>
          <span>
            {state.type === "emailSent" ? (
              <>
                If you haven't received an email in 5 minutes, check your spam,{" "}
                {countdown > 0 ? (
                  <span className="ms-2 " style={{ color: "#64e5ff" }}>
                    {" "}
                    Resend in{" "}
                    {Math.floor(countdown / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(countdown % 60).toString().padStart(2, "0")}
                  </span>
                ) : (
                  <span
                    onClick={resend}
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                  >
                    resend
                  </span>
                )}
                , or{" "}
                <span
                  onClick={setNewMail}
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                >
                  try a different email
                </span>
              </>
            ) : (
              ""
            )}

            {state.type === "Failiure" ? (
              <span
                onClick={setNewMail}
                className="text-primary"
                style={{ cursor: "pointer" }}
              >
                try a different email
              </span>
            ) : (
              ""
            )}

            {state.type === "resend" ? (
              <>
                {countdown > 0 ? (
                  <span className="ms-2 " style={{ color: "#64e5ff" }}>
                    {" "}
                    Resend in{" "}
                    {Math.floor(countdown / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(countdown % 60).toString().padStart(2, "0")}
                  </span>
                ) : (
                  <span
                    onClick={resend}
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                  >
                    resend
                  </span>
                )}
                , or{" "}
                <span
                  onClick={setNewMail}
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                >
                  try a different email
                </span>
              </>
            ) : (
              ""
            )}
          </span>
        </div>

        {state?.type == "resetPassword" && (
          <>
            <div
              className={`text-center d-flex flex-column  align-self-center w-75 `}
            >
              <form onSubmit={reset}>
                <Input
                  placeholder="Enter email.."
                  name="email_id"
                  id="email_id"
                  onChange={onValueChanged}
                  left={"-250px"}
                />
                <Button
                  type={"submit"}
                  text={"Continue"}
                  className="simple-button sideAnim"
                  id="signin"
                />
              </form>
            </div>
            <p className={`already-have-account`}>
              Return to{" "}
              <Link href={"/signin/"} prefetch={false} legacyBehavior>
                <ins>sign in</ins>
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
