"use client";
import React from "react";
import Button from "@/libs/button/page";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "@/store/credentials";
import Link from "next/link";
import Image from "next/image";
import { config } from "../../../../config";
import ApiFrontend from "@/libs/apiFrontend";
import { showAlert } from "@/store/alert";
import { getRoutes } from "@/routes";

const Sidebar = () => {
  const dispatch = useDispatch();
  const path = usePathname();
  const router = useRouter();
  const loginType = useSelector(
    (state) => state?.entities?.credentials?.login_type
  );
  const selectedPlan = useSelector(
    (state) => state.entities.credentials?.selectedPlan
  );

  const handleClose = () => {
    dispatch(toggleSidebar());
  };

  async function upgradePlan() {
    try {
      const response = await ApiFrontend({
        url: "/payment/create-customer-portal-session",
        method: "post",
        dispatch,
        fieldId: "managesub",
      });

      const { url } = response?.success;

      // Redirect to the Stripe Checkout page
      window.location.href = url;
    } catch (error) {
      dispatch(showAlert(`${error?.message}`, "error"));
    }
  }

  const isFreePlanActivated = selectedPlan === "free";

  const routes = getRoutes("sidebar", { isFreePlanActivated, upgradePlan });

  const doLogout = () => {
    if (loginType === "google") signOut();

    dispatch({ type: "logout", payload: "" });
    router.push("/signin");
  };

  const handleClick = (l) => {
    l?.to ? l?.to() : router.push(l.path);
    handleClose();
  };

  return (
    <div className="sidebar h-100">
      <div>
        <i
          onClick={handleClose}
          className="bi bi-x-circle z-3 d-md-none position-absolute end-0 me-3 fs-4 mt-2"
        />
        <Link href="/">
          <Image
            className="ms-3 mt-3 mb-3 img"
            src={`/images/${config.logo}`}
            alt="logo image"
            width={175}
            height={32}
          />
        </Link>
        <div className="routes">
          {routes?.map((l, i) => {
            return (
              <div key={i}>
                <Button
                  icon={`bi ${l.icon} me-2 pe-1`}
                  className={`tab rounded-0 ${path == l.path && "active"}`}
                  text={l.name}
                  onClick={() => handleClick(l)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="botttom">
        <Button
          icon={`bi bi-power me-2 pe-1`}
          className={`tab rounded-0`}
          text="logout"
          onClick={() => doLogout()}
        />
      </div>
    </div>
  );
};

export default Sidebar;
