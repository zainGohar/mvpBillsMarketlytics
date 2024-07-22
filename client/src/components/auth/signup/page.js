"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/legacy/image";
import { useSession } from "next-auth/react";
import { registerNewUserApiCallWeb } from "@/store/credentials";
import Link from "next/link";
import { Input, Checkbox } from "@/libs/input";
import Button from "@/libs/button/page";
import { validateFunc, validateProperty } from "@/libs/Validation";
import { hideError, setError, removeErrors } from "@/store/error";

import { AppLoader } from "@/libs/Loader";
import { signIn } from "next-auth/react";
import { config } from "../../../../config";

export default function Signup() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (status === "unauthenticated") setLoading(false);
  }, [status]);

  const callbackNewUserApiCallWeb = (data) => {
    sessionStorage.setItem("email", data?.success?.email_id);
    router.push("/verifymail");
  };

  const error = useSelector((state) => state.entities.error);
  const Cxolor = {
    borderColor: "#fd526c",
    backgroundColor: "#ff6e7d28",
  };

  const onValueChange = async (e) => {
    const name = e.target.id;
    const value = e.target.value || e.target.checked; // using or operator

    const errorMessage = await validateProperty(name, value);
    if (errorMessage) dispatch(setError(errorMessage));
    else dispatch(removeErrors(name));
  };

  useEffect(() => {
    dispatch(hideError());
  }, []);

  const registerUser = async (event) => {
    event.preventDefault();

    const email = event.target.email_id.value
      ? event.target.email_id.value.toLowerCase()
      : null;
    const password = event.target.password.value;

    const data = {
      [event.target.email_id.name]: email,
      [event.target.password.name]: password,
      [event.target.CheckBox.name]: event.target.CheckBox.checked,
    };
    const errors = await validateFunc(data, "signup");
    dispatch(setError(errors));

    if (!errors) {
      await dispatch(
        registerNewUserApiCallWeb({
          email,
          password,
          callbackNewUserApiCallWeb,
        })
      );
    }
  };

  const handlereDirect = (value) => {
    router.push(`https://${config.url}/${value}`);
    router.push(`https://${config.url}/${value}`);
  };

  if (loading) {
    return <AppLoader />;
  } else {
    return (
      <div
        className={`d-flex justify-content-center align-items-center signin`}
      >
        <div
          className={`box   container  d-flex flex-column justify-content-center`}
        >
          <div className={"logo"}>
            <Image
              src={`/images/${config.icon}`}
              alt="logo"
              className="img-fluid"
              width="80"
              height="80"
            />
          </div>
          <div className={"heading"}>
            <p className="text my-3">Try {config.name} for free</p>
          </div>

          <div className={"sub-heading"}>
            <span>Your Personal Document Assistant</span>
          </div>
          <div
            className={`text-center d-flex flex-column  align-self-center w-75 `}
          >
            <form onSubmit={registerUser}>
              <Input
                placeholder="Enter email.."
                name="email_id"
                id="email_id"
                left={"-250px"}
                onChange={onValueChange}
              />

              <Input
                placeholder="Enter password.."
                name="password"
                id="password"
                type={"password"}
                left={"-250px"}
                onChange={onValueChange}
              />

              <div
                style={error?.CheckBox && Cxolor}
                className={`form-check justify-content-start cookies-bar d-flex`}
              >
                <Checkbox
                  name="CheckBox"
                  className={`form-check-input checkbox`}
                  id="CheckBox"
                  type="checkbox"
                  onChange={onValueChange}
                />
                <label className={`form-check-label mx-3 content`}>
                  I have read and agree to {config.name}
                  <span onClick={() => handlereDirect("privacy-policy")}>
                    {" "}
                    Privacy Policy.{" "}
                  </span>
                </label>
              </div>

              <Button
                type={"submit"}
                text={"Sign Up"}
                className="simple-button sideAnim"
                id="signup"
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
                    alt="google logo"
                  />
                  Continue with Google
                </div>
              </button>
            </div>

            <p className={`already-have-account`}>
              Already signed up.&nbsp;{" "}
              <Link href={"/signin/"} prefetch={false} legacyBehavior>
                <ins> Signin</ins>
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
