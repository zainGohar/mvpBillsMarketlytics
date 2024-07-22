"use client";

import React, { useCallback, memo } from "react";
import Image from "next/legacy/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import getLightDarkValue, { toggleTheme, useTheme } from "@/libs/theme/page";
import { useDispatch, useSelector } from "react-redux";
import { ViewPoint, useScrollWatcher } from "@/libs/common";
import { toggleSidebar } from "@/store/credentials";
import Button from "@/libs/button/page";
import { getRoutes } from "../../routes";
import { config } from "../../../config";

const HeaderVisitor = () => {
  const routes = getRoutes("visitor");
  const pathname = usePathname();
  const dispatch = useDispatch();

  const toggleIcon = getLightDarkValue("bi-moon-fill", "bi-sun-fill");
  const toggleText = getLightDarkValue("Dark", "Light");

  const view = ViewPoint("600px");
  const sidebar = useSelector((state) => state.entities.credentials.sidebar);

  const { isWithinRange, scrollPosition } = useScrollWatcher(
    [
      { start: 1400, end: 1880 },
      { start: 2100, end: 2400 },
      { start: 2800, end: 3200 },
      { start: 4250, end: 5000 },
    ],
    "light"
  );

  const widthRange =
    isWithinRange && (scrollPosition < 1400 || scrollPosition > 1880);

  const drawerClass = view
    ? sidebar
      ? "width-mobile"
      : "width-desktop"
    : sidebar
    ? "width-desktop"
    : "width-mobile";

  const handleToggleSidebar = useCallback(
    () => dispatch(toggleSidebar()),
    [dispatch]
  );

  const renderRoutes = useCallback(
    () =>
      routes?.map((r) => (
        <Link href={r.path ?? "/"} key={r.name}>
          <p className={`${pathname === r.path ? "active" : ""}`}>{r.name}</p>
        </Link>
      )),
    [routes, pathname]
  );
  const imgClass = getLightDarkValue("img-light", "img-dark");
  const renderlogo = () => {
    return (
      <Link href="/">
        <Image
          src={`/images/${config.logo}`}
          alt="logo"
          width={200}
          height={40}
          className={widthRange ? "img-dark" : imgClass}
        />
      </Link>
    );
  };

  //=====================================================================

  return (
    <>
      <div className="visitor-header sticky-top">
        {!view && renderlogo()}
        {!view && (
          <div className={`routes ${isWithinRange ? "dark" : "light"}`}>
            {renderRoutes()}
          </div>
        )}
        {view && (
          <Button
            icon={`${widthRange ? "dark" : "light"} bi bi-list`}
            className="bg-transparent border-0"
            onClick={handleToggleSidebar}
          />
        )}
        <Button
          icon={`bi ${toggleIcon} me-2`}
          text={toggleText}
          title={`${toggleText} Theme`}
          className={`theme-button ${
            widthRange ? "dark" : "light"
          } bg-transparent border-0`}
          onClick={toggleTheme}
        />
      </div>
      {view && !sidebar && (
        <div onClick={handleToggleSidebar} className="overlay-mobile" />
      )}
      {view && (
        <div className={`mobile-header-visitor animation ${drawerClass}`}>
          <div className="drawer">
            <i
              onClick={handleToggleSidebar}
              className="icon bi bi-x-circle z-3 d-md-none position-absolute end-0 me-3 fs-4"
              aria-label="Close drawer"
            />
            {renderlogo()}
            <div className="routes mt-4">{renderRoutes()}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(HeaderVisitor);
