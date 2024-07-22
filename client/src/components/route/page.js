"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { persistStore } from "redux-persist";
import { loginUserApiCallGoogle } from "@/store/credentials";
import { AppLoader } from "@/libs/Loader";
import { store } from "@/store/configureStore";

export default function Route({ children }) {
  const [storePersist, setStorePersist] = useState(null);

  const dispatch = useDispatch();
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const logIn = useSelector((state) => state?.entities?.credentials?.signedIn);
  const loginType = useSelector(
    (state) => state?.entities?.credentials?.login_type
  );
  const [loading, setLoading] = useState(true);

  const callback = () => {
    router.push("/");
  };

  useEffect(() => {
    setStorePersist(persistStore(store));
  }, [store]);

  useEffect(() => {
    if (logIn != undefined) {
      if (status === "authenticated") {
        if (!logIn) {
          dispatch(loginUserApiCallGoogle(session?.user?.email, callback));
        }
      }
    }
  }, [status]);

  useEffect(() => {
    if (storePersist) {
      if (logIn) {
        if (
          pathname.includes("/signin") ||
          pathname.includes("/signup") ||
          pathname.includes("/verify") ||
          pathname.includes("/verifymail") ||
          pathname.includes("/forget-password") ||
          pathname.includes("/reset-password")
        ) {
          router.push("/");
        } else {
          setLoading(false);
        }
      } /* else if (pathname === "/" && !logIn) {
        router.push("/signin");
      } */ else {
        if (
          pathname.includes("/signin") ||
          pathname.includes("/signup") ||
          pathname.includes("/verify") ||
          pathname.includes("/pricing") ||
          pathname.includes("/verification") ||
          pathname.includes("/forget-password") ||
          pathname.includes("/reset-password") ||
          pathname.includes("/roadmap") ||
          pathname.includes("/privacy-policy") ||
          pathname.includes("/terms-conditions") ||
          pathname.includes("/blog") ||
          pathname.includes("/blog/[slug]") ||
          pathname === "/"
        ) {
          setLoading(false);
        } else router.push("/signin");
      }
    }
  }, [storePersist, pathname, status]);

  if (loading) {
    return <AppLoader />;
  } else {
    return <div>{children}</div>;
  }
}
