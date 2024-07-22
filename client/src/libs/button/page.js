"use client";
import React, { useState, useRef, useEffect } from "react";
import { BtnLoader, BtnLoaderSimple } from "../Loader";
import Image from "next/legacy/image";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ViewPoint } from "../common";
import Modal from "react-bootstrap/Modal";
import { Input } from "../input";

export default function Button(props) {
  const {
    classNameMain,
    autoWidth,
    alert, // { visible, size, title, description, inputType }
    showLoading,
    height,
    width,
    //===================================================
    text,
    onClick,
    className,
    icon, // New prop for icon class name
    iconOnClick, // Optional: A separate onClick handler for the icon, if it should behave differently
    id,
    loading,
    tooltipContent,
    tagProps, // { tagText, tagBgColor, tagColor }
    loaderProps, // { loaderPosition, showLoader, loadingValue }
    ...rest
  } = props;

  const loader = useSelector((state) => state.entities?.loader);
  const [showModal, setShowModal] = useState(false);

  const view = ViewPoint("600px");

  const [modalInput, setModalInput] = useState(null);

  const handleButtonClick = () => {
    if (alert?.visible) {
      setShowModal(true);
    } else {
      onClick && onClick();
    }
  };

  const renderLoader = () => {
    if (!showLoading && id && loader && loader[id]) {
      return <BtnLoaderSimple {...loaderProps} />;
    }
  };

  const renderTag = () => {
    if (tagProps?.tagText) {
      return (
        <div
          className=" text-center rounded position-absolute px-2"
          style={{
            zoom: "80%",
            top: "20%",
            right: "10%",
            backgroundColor: !tagProps?.tagBgColor
              ? "#fae69e"
              : tagProps?.tagBgColor,
            color: !tagProps?.tagColor ? "black" : tagProps?.tagColor,
            zIndex: "1080",
          }}
        >
          <p className="mb-1 ">{tagProps?.tagText}</p>
        </div>
      );
    }
  };

  const renderTooltip = () => {
    if (tooltipContent) {
      // Placeholder for tooltip logic, consider using a Tooltip component
      return (
        <div className=" position-absolute info-btn-button">
          <OverlayTrigger
            placement={view ? "right" : "bottom"}
            overlay={
              <div
                className="tooltip text rounded"
                style={{
                  marginTop: view ? "50px" : "10px",
                  marginRight: "150px",
                }}
                dangerouslySetInnerHTML={{
                  __html: tooltipContent,
                }}
              />
            }
          >
            <div className="bi bi-info-circle" />
          </OverlayTrigger>
        </div>
      );
    }
  };

  const renderIcon = () => {
    if (icon) {
      return <i className={icon} onClick={iconOnClick} />;
    }
  };

  return (
    <>
      {alert?.visible && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size={alert?.size ? alert?.size : "sm"}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {alert?.title ? alert?.title : "Email Required!"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-2">
            &nbsp;
            {alert?.description
              ? alert?.description
              : "Submit your email to use free plan:"}
            {alert?.input ? (
              <Input
                onChange={(e) => setModalInput(e)}
                type={alert?.inputType ? alert?.inputType : "text"}
              />
            ) : null}
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button
              onClick={() => setShowModal(false)}
              text="Close"
              className="bg-transparent outline-0 border border-secondary p-3 py-1"
              padding="2px 6px"
            />
            <Button
              onClick={
                alert?.visible
                  ? alert?.onClick
                    ? (e) => {
                        alert?.onClick(alert?.input ? modalInput : e),
                          setShowModal(false);
                      }
                    : () => {
                        onClick && onClick(), setShowModal(false);
                      }
                  : null
              }
              id={id}
              text="Proceed"
              className="simple-button py-1"
            />
          </Modal.Footer>
        </Modal>
      )}

      <div
        className={`position-relative ${classNameMain}`}
        style={{
          height: height,
          width: width,
          pointerEvents: !loading && loader && loader[id] ? "none" : "",
        }}
      >
        {renderLoader()}
        {renderTag()}
        {renderTooltip()}

        <div
          style={
            loading
              ? {
                  opacity: "50%",
                  pointerEvents: "none",
                }
              : {}
          }
        >
          <button
            {...rest}
            id={id}
            className={`${
              !autoWidth && "w-100"
            } ${className} rounded animation position-relative ${
              iconOnClick ? "d-flex" : "inherit"
            }`}
            onClick={handleButtonClick}
          >
            {!loading && loader && loader[id] ? (
              <div
                style={{
                  padding: `7px`,
                }}
              >
                <BtnLoader position="center" />
              </div>
            ) : (
              <>
                {renderIcon()}
                <span>{text}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export const DropButton = (props) => {
  const {
    icon,
    text,
    list,
    DropdownStyle,
    buttonStyle,
    dropdownClass,
    buttonClass,
    textStyle,
    textClass,
    align,
    bottomButton,
    id,
  } = props;

  const CustomMenu = React.forwardRef(
    ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
      const [value, setValue] = useState("");

      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <Input
            value={value}
            className="mx-3 mb-2 mt-3 w-auto rounded-0"
            placeholder="Type to filter..."
            onChange={(e) => setValue(e.target.value)}
          />
          <ul className="list-unstyled mb-0 dropdownoverFlow">
            {React.Children?.toArray(children)?.filter(
              (child) =>
                !value ||
                child?.props?.children[1]?.props?.eventKey?.props?.children[1]?.props?.children
                  ?.toLowerCase()
                  ?.startsWith(value)
            )}
          </ul>
          {bottomButton?.text && (
            <div className={bottomButton ? `p-2` : ``}>
              <Button
                text={bottomButton?.text}
                BIcon={bottomButton?.icon}
                className={bottomButton?.class}
                onClick={bottomButton?.onClick}
              />
            </div>
          )}
        </div>
      );
    }
  );

  const [show, setShow] = useState(false);

  function handleClick() {
    setShow(true);
  }
  function handleClose() {
    setShow(false);
  }

  return (
    <>
      <Dropdown size="lg" id={id}>
        <Dropdown.Toggle
          id="dropdown-basic"
          style={buttonStyle}
          className={`${buttonClass} bg-transparent border-0 borderDropdown defaultbtn sideAnim d-flex justify-content-between align-items-center`}
        >
          <p className={`text mb-0 ${textClass}`} style={textStyle}>
            <>
              <i className={icon} />
              {text}
            </>
          </p>
        </Dropdown.Toggle>

        <Dropdown.Menu
          as={list?.length > 5 ? CustomMenu : undefined}
          className={list?.length < 5 ? `${dropdownClass} p-0 m-0` : "p-0"}
          style={list?.length < 5 ? DropdownStyle : {}}
          align={align ? align : ""}
        >
          {list?.map((d, i) => {
            return (
              !d?.disabled && (
                <>
                  {d.alert && (
                    <Modal show={show} onHide={handleClose} centered size="sm">
                      <Modal.Header closeButton>
                        <Modal.Title>{d.alert?.title}</Modal.Title>
                      </Modal.Header>
                      <Modal.Body className="py-2">
                        {d.alert?.description
                          ? d.alert?.description
                          : "Are you sure?"}
                      </Modal.Body>
                      <Modal.Footer className="py-2">
                        <Button
                          onClick={handleClose}
                          text="Close"
                          className="btn btn-outline-secondary"
                          padding="2px 6px"
                        />
                        <Button
                          onClick={
                            d.alert
                              ? () => {
                                  d.onClick(), handleClose();
                                }
                              : null
                          }
                          id={`${i}-file-folder`}
                          text="Proceed"
                          className="simple-button py-1"
                        />
                      </Modal.Footer>
                    </Modal>
                  )}
                  {i > 0 && <div className=" " />}
                  <Dropdown.Item
                    eventKey={d.link}
                    onClick={d.alert ? handleClick : d.onClick}
                    className={`${d.className} d-flex`}
                  >
                    <i className={d.linkIcon} />
                    {d.link}
                  </Dropdown.Item>
                </>
              )
            );
          })}

          {bottomButton?.text && list?.length < 5 && (
            <div className={bottomButton.text ? `p-2` : ``}>
              <Button
                text={bottomButton.text}
                BIcon={bottomButton.icon}
                className={bottomButton.class}
                onClick={bottomButton.onClick}
              />
            </div>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
