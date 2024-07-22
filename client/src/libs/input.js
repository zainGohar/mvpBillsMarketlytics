"use client";
import React, { useState } from "react";
import Callout from "@/libs/GetPopup/page";
import { BtnLoader } from "./Loader";
import { useSelector } from "react-redux";

export function Input(props) {
  const {
    id,
    onFocus,
    onBlur,
    style,
    className,
    left,
    mainMargin,
    type,
    label,
    ...rest
  } = props;

  const [view, setView] = useState("d-none");
  const errors = useSelector((state) => state.entities.error);
  const loader = useSelector((state) => state.entities.loader);
  const errorCxolor = {
    border: "1px solid #fd526c",
  };

  const styleFormat = () => {
    const errorStyle = errors && id && errors[id] ? errorCxolor : undefined;
    return { ...style, ...errorStyle };
  };

  // show password on click
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const handleTogglePassword = () => {
    togglePasswordVisibility();
  };
  return (
    <>
      <div
        onFocus={onFocus}
        onBlur={onBlur}
        className={`my-1 w-100 input-box ${
          id && errors?.[id] && "error-margin"
        } ${className}`}
      >
        {/* {id && errors?.[id] && (
          <div className={`Callout_Text_Box ${view}`}>
            <Callout
              errorContent={errors[id].message}
              left={left}
              width="350px"
            />
          </div>
        )} */}
        {errors && id && errors[id]?.focus && document.getElementById(id)
          ? document.getElementById(id).scrollIntoView({ behavior: "smooth" })
          : null}

        {loader && id && loader[id] && (
          <div
            className="position-absolute d-flex w-100 h-100 align-items-center"
            style={{ right: "10px" }}
          >
            <BtnLoader
              position="end"
              pR="4"
              style={{ backgroundColor: "grey" }}
            />
          </div>
        )}

        {label && (
          <label className="label d-flex ms-1 mb-2">
            {label}
            {rest?.required && <p className="text-danger fs-6 ms-1 mb-0">*</p>}
          </label>
        )}
        <input
          {...rest}
          onWheel={(e) => e.target.blur()}
          id={id}
          className={`form-control input`}
          onFocus={() => setView("d-block")}
          onBlur={() => setView("d-none")}
          style={styleFormat()}
          type={
            type == "password"
              ? isPasswordVisible
                ? "text"
                : "password"
              : type
          }
        />
        {type === "password" && (
          <div
            className={`password_Show_Button ${
              label
                ? "password_Show_Button_position_with_label"
                : "password_Show_Button_position"
            }`}
          >
            <i
              onClick={handleTogglePassword}
              className={
                isPasswordVisible ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"
              }
            />
          </div>
        )}
        {id && errors?.[id] && (
          <p className="error-message">{errors[id].message}</p>
        )}
      </div>
    </>
  );
}

export function Checkbox(props) {
  const {
    type,
    id,
    onChange,
    value,
    name,
    style,
    className,
    checked,
    onClick,
  } = props;

  return (
    <input
      id={id}
      onChange={onChange}
      type={type}
      className={`${className} input-box`}
      value={value == null ? "" : value}
      name={name}
      onClick={onClick}
      style={style}
      checked={checked}
    />
  );
}

export function TextArea(props) {
  const {
    type,
    placeholder,
    id,
    onChange,
    onKeyDown,
    value,
    disabled,
    name,
    rows,
    style,
  } = props;

  return (
    <div className="my-1">
      <textarea
        id={id}
        placeholder={placeholder}
        onChange={onChange}
        type={type}
        className="form-control"
        value={value == null ? "" : value}
        disabled={disabled}
        onKeyDown={onKeyDown}
        name={name}
        style={style}
        rows={rows}
      />
    </div>
  );
}
