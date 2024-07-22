"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateFunc, validateProperty } from "@/libs/Validation";
import { hideError, setError, removeErrors } from "@/store/error";
import { signIn } from "next-auth/react";
import Image from "next/legacy/image";
import { useSession } from "next-auth/react";
import { AppLoader } from "@/libs/Loader";
import { loginUserApiCallWeb } from "@/store/credentials";
import { Input } from "@/libs/input";
import Button from "@/libs/button/page";
import { config } from "../../../../config";

export default function SignIn() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (status === "unauthenticated") setLoading(false);
  }, [status]);

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

  const callback = () => {
    router.push("/");
  };

  const callbackErrorOnLogin = (response) => {
    if (response?.status === 403) {
      router.push("/verifymail");
    }
  };

  const logIn = async (event) => {
    event.preventDefault();

    const email = event.target.email_id.value
      ? event.target.email_id.value.toLowerCase()
      : null;
    const password = event.target.password.value;

    const data = {
      [event.target.email_id.name]: email,
      [event.target.password.name]: password,
    };
    const errors = await validateFunc(data, "signin");
    if (errors) {
      dispatch(setError(errors));
    } else {
      dispatch(hideError(errors));
      await dispatch(
        loginUserApiCallWeb(email, password, callback, callbackErrorOnLogin)
      );
    }
  };

  if (loading) {
    <AppLoader />;
  } else {
    return (
      <div
        className={`d-flex justify-content-center align-items-center signin`}
      >
        <div
          className={`box container d-flex flex-column justify-content-center`}
        >
          <div className={"logo"}>
            <Image
              src={`/images/${config.icon}`}
              alt="logo image"
              className="img-fluid"
              width="80"
              height="80"
            />
          </div>

          <div className={"heading"}>
            <p className="text my-3">Log in to {config.name}</p>
          </div>

          <div className={"sub-heading"}>
            <span>Your Personal Document Assistant</span>
          </div>

          <div
            className={`text-center d-flex flex-column align-self-center w-75 `}
          >
            <form onSubmit={logIn}>
              <Input
                placeholder="Enter email.."
                name="email_id"
                id="email_id"
                left={"-250px"}
                onChange={onValueChanged}
              />
              <Input
                placeholder="Enter password.."
                type={"password"}
                name={"password"}
                id={"password"}
                left={"-250px"}
                onChange={onValueChanged}
              />

              <p
                className="my-2 text-end me-2 cursor-pointer"
                onClick={() => router.push("/forget-password")}
              >
                Forgot password?
              </p>

              <Button
                type={"submit"}
                text={"Sign In"}
                className="simple-button sideAnim"
                id="signin"
              />
              <div className={`or-border`}>
                <div></div>
                <span>OR</span>
                <div></div>
              </div>
            </form>

            <div className={`google`}>
              <button className={"button"} onClick={() => signIn("google")}>
                <div className="d-flex justify-content-between mx-1">
                  <Image
                    width={"20"}
                    height={"20"}
                    src={"/svg/google.svg"}
                    alt="google image"
                  />
                  Continue with Google
                </div>
              </button>
            </div>

            <p className={`already-have-account`}>
              Don’t have an account?{" "}
              <Link href={"/signup/"} prefetch={false} legacyBehavior>
                <ins>Signup</ins>
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
