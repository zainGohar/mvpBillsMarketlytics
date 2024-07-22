"use client";
import { useSelector, useDispatch } from "react-redux";
import { store } from "./configureStore";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { useEffect, useRef } from "react";
import { loginDetailsApiCall } from "@/store/credentials";
import { AppLoader } from "@/libs/Loader";

// This should only be done once so that the persistor isn't recreated on every re-render.
const persistor = persistStore(store);

export function Persist({ children }) {
  const dispatch = useDispatch();
  const logIn = useSelector((state) => state?.entities?.credentials?.signedIn);
  const onetimeRef = useRef(true);

  useEffect(() => {
    async function runOneTime() {
      if (onetimeRef.current && logIn) {
        onetimeRef.current = false;
        await dispatch(loginDetailsApiCall());
      }
    }
    runOneTime();
  }, [logIn]);

  return (
    <PersistGate loading={<AppLoader />} persistor={persistor}>
      {children}
    </PersistGate>
  );
}
