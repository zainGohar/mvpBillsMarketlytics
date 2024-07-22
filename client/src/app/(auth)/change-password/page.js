"use client";

import Button from "@/libs/button/page";
import { Input } from "@/libs/input";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { validateFunc, validateProperty } from "../../../libs/Validation";
import { removeErrors, setError } from "@/store/error";
import { changePassword } from "@/store/credentials";

const ChangePassword = () => {
  const dispatch = useDispatch();

  const onValueChanged = async (e) => {
    const name = e.target.id;
    const value = e.target.value || e.target.checked; // using or operator

    const errorMessage = await validateProperty(name, value);
    if (errorMessage) dispatch(setError(errorMessage));
    else dispatch(removeErrors(name));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    const password = event.target.password.value;
    const newPassword = event.target.new_password.value;

    const data = {
      [event.target.password.name]: password,
      [event.target.new_password.name]: newPassword,
    };
    const errors = await validateFunc(data, "changepassword");
    dispatch(setError(errors));

    if (!errors) {
      await dispatch(
        changePassword({
          password,
          newPassword,
          callback,
        })
      );
    }
  };

  const callback = () => {
    // Assuming the password update is successful, clear the input fields
    document.getElementById("password").value = ""; // Clear the current password input
    document.getElementById("new_password").value = ""; // Clear the new password input
  };

  return (
    <div className="p-4">
      <div className="card change-password-box">
        <p className="heading">Update Your Password</p>

        <form onSubmit={handleChangePassword}>
          <Input
            placeholder="Enter Current Password.."
            id="password"
            name="password"
            type="password"
            left="-250px"
            onChange={onValueChanged}
            label="Current Password"
            className="mb-3"
          />
          <Input
            placeholder="Enter New Password.."
            id="new_password"
            name="new_password"
            type="password"
            left="-250px"
            onChange={onValueChanged}
            label="New Password"
            className="mb-3"
          />

          <Button
            type={"submit"}
            text="Update"
            className="simple-button"
            id="changepassword"
            name="changepassword"
          />
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
