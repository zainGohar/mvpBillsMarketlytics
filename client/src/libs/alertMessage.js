"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideAlert, hideWifiError, WifiError } from "../store/alert";

const AlertMessage = () => {
  const { alerts, showWifiError } = useSelector(
    (state) => state.entities.alert
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (alerts?.length > 0) {
      const timer = setTimeout(() => {
        dispatch(hideAlert(0));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alerts, dispatch]);

  useEffect(() => {
    // check for network status and dispatch showWifiError action if necessary
    const handleNetworkChange = () => {
      if (!navigator.onLine) {
        dispatch(WifiError());
      } else {
        dispatch(hideWifiError()); // hide wifi error message when network is available again
      }
    };
    window.addEventListener("offline", handleNetworkChange);
    window.addEventListener("online", handleNetworkChange);

    return () => {
      window.removeEventListener("offline", handleNetworkChange);
      window.removeEventListener("online", handleNetworkChange);
    };
  }, [dispatch]);

  return (
    <>
      {showWifiError && (
        <div className="toast-message danger">
          <span onClick={() => dispatch(hideWifiError())} className="close" />
          <div className="message">
            WiFi is disconnected. Please check your network connection.
          </div>
        </div>
      )}
      <div className="position-fixed d-flex flex-column align-items-end alert-style">
        {alerts?.map((alert, index) => (
          <div key={alert.id} className="alert-toast active mt-2">
            <div className="toast-content">
              <i
                className={`bi bi-${
                  alert.type == "success" ? "check" : "exclamation"
                } check`}
              />

              <div className="message">
                <span className="text text-1">{alert.type}</span>
                <span className="text text-2">{alert.message}</span>
              </div>
            </div>
            <i
              className="bi bi-x-lg close"
              onClick={() => dispatch(hideAlert(index))}
            />

            <div className={`progress active  progress-${alert.type}`} />
          </div>
        ))}
      </div>
    </>
  );
};

export default AlertMessage;
