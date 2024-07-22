"use client";
import Button from "@/libs/button/page";
import { ViewPoint } from "@/libs/common";
import getLightDarkValue, { toggleTheme } from "@/libs/theme/page";
import { getRoutes } from "@/routes";
import { toggleSidebar } from "@/store/credentials";
import { usePathname } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";

const HeaderAdmin = () => {
  const dispatch = useDispatch();
  const path = usePathname();

  const view = ViewPoint("600px");

  const routes = getRoutes()?.find((r) => r.path == path);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  const toggleIcon = getLightDarkValue("bi-moon-fill", "bi-sun-fill");
  const toggleText = getLightDarkValue("Dark", "Light");

  return (
    <div className="admin-header">
      <div className="d-flex align-items-center">
        <i
          className={`bi bi-text-left toggle-icon`}
          onClick={handleToggleSidebar}
        />
        <h1 className="ms-3">{routes?.name}</h1>
      </div>

      <Button
        icon={`bi ${toggleIcon} me-2`}
        text={toggleText}
        title={toggleText + " " + "Theme"}
        className="theme-button theme-button-color bg-transparent border-0"
        onClick={toggleTheme}
      />
    </div>
  );
};

export default HeaderAdmin;
