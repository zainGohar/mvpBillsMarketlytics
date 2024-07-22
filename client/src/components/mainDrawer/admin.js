import React from "react";
import { ViewPoint } from "@/libs/common";
import { toggleSidebar } from "@/store/credentials";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./sidebar/page";
import HeaderAdmin from "../header/headerAdmin";
import FooterAdmin from "../footer/footerAdmin";

const Admin = ({ children }) => {
  const dispatch = useDispatch();

  const view = ViewPoint("600px");
  const sidebar = useSelector((state) => state.entities.credentials.sidebar);

  const mainDrawrClass = {
    true: {
      true: "width-desktop",
      false: "width-mobile",
    },
    false: {
      true: "width-mobile",
      false: "width-desktop",
    },
  };

  return (
    <>
      <div className="main-drawr">
        <div
          className={`main-sidebar ${
            mainDrawrClass[!!view][!!sidebar]
          } animation`}
        >
          <div className="Drawer-content">
            <Sidebar />
          </div>
        </div>

        <div
          className={`animation drawer-margin-${
            sidebar ? "mobile" : "desktop"
          }`}
        >
          {view && sidebar && (
            <div
              onClick={() => dispatch(toggleSidebar())}
              className="overlay-mobile"
            />
          )}
          <HeaderAdmin />
          {children}
          <FooterAdmin />
        </div>
      </div>
    </>
  );
};

export default Admin;
