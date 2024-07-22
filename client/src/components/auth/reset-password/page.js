"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { validateFunc, validateProperty } from "@/libs/Validation";
import { hideError, setError, removeErrors } from "@/store/error";
import Image from "next/legacy/image";
import { resetPassword, verifyResetPasswordLink } from "@/store/credentials";
import { Input } from "@/libs/input";
import Button from "@/libs/button/page";
import { AppLoader } from "@/libs/Loader";
import { SpinnerLoader } from "@/libs/Loader/index";
import { config } from "../../../../config";

export default function ResetPassword() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    type: "resetPassword",
    logo: "",
    heading: "Reset your password",
    content: `Enter a new password`,
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

  const token = searchParams.get("token");

  useEffect(() => {
    if (token)
      dispatch(
        verifyResetPasswordLink({
          token,
          callbackOnVerifyResetPasswordLink,
          callbackErrorOnVerifyResetPasswordLink,
        })
      );
    else {
      setLoading(false);
      setState({
        type: "Failiure",
        logo: "bi bi-exclamation-triangle text-danger",
        heading: "Error",
        content: `Oops, Invalid Link.`,
      });
    }
  }, [token]);

  const callbackOnVerifyResetPasswordLink = () => {
    setLoading(false);
  };

  const callbackErrorOnVerifyResetPasswordLink = (response) => {
    setLoading(false);

    setState({
      type: "Failiure",
      logo: "bi bi-exclamation-triangle text-danger",
      heading: "Error",
      content: response?.data?.message?.content,
    });
  };

  ////////////// reset button code starts /////////////////////

  const callback = (response) => {
    setState({
      type: "success",
      logo: "bi bi-check-circle text-success",
      heading: "password changed",
      content: `You have successfully changed your password.`,
    });
  };

  const callbackErrorOnReset = (response) => {
    if (response.status === 410) {
      setState({
        type: "resend",
        logo: "bi bi-exclamation-triangle text-danger",
        heading: "Error",
        content: response?.data?.message?.content,
      });
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

    const password = event.target.password.value
      ? event.target.password.value.toLowerCase()
      : null;

    const data = {
      [event.target.password.name]: password,
    };

    const errors = await validateFunc(data, "resetpassword");
    if (errors) {
      dispatch(setError(errors));
    } else {
      dispatch(hideError(errors));
      await dispatch(
        resetPassword({ password, token, callback, callbackErrorOnReset })
      );
    }
  };

  ////////////// reset button code ends /////////////////////

  if (loading) {
    return <AppLoader></AppLoader>;
  } else {
    return (
      <div
        className={`d-flex justify-content-center align-items-center signin`}
      >
        <SpinnerLoader id="reset-loader" />

        <div
          className={`box container  d-flex flex-column justify-content-center `}
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

          <div className={"sub-heading"}>
            <span>{state?.content}</span>
          </div>

          <div className={"sub-heading"}>
            <span>
              {state.type === "success" ? (
                <>
                  <p className={`already-have-account`}>
                    Return to{" "}
                    <Link href={"/signin/"} prefetch={false} legacyBehavior>
                      <ins>sign in</ins>
                    </Link>
                  </p>
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
                    placeholder="Enter password.."
                    type={"password"}
                    name={"password"}
                    id={"password"}
                    left={"-250px"}
                    onChange={onValueChanged}
                  />

                  <Button
                    type={"submit"}
                    text={"Continue"}
                    className="simple-button sideAnim"
                    id="signin"
                  />
                </form>
                <p className={`already-have-account`}>
                  Return to{" "}
                  <Link href={"/signin/"} prefetch={false} legacyBehavior>
                    <ins>sign in</ins>
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}
