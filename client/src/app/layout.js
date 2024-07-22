import React from "react";
import NextAuthProvider from "../components/nextAuthProvider";
import { Persist } from "@/store/persistGate";
import { Providers } from "@/store/provider";
import AlertMessage from "@/libs/alertMessage";
import Route from "../components/route/page";
import "@/styles/desktop.scss";
import "@/styles/globals.scss";
import "@/styles/mobile.scss";
import "@/styles/tab.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.css";
import MainDrawr from "@/components/mainDrawer/page";
import { config } from "../../config";

export const metadata = {
  title: config.seo.root.title,
  description: config.seo.root.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body id={"root"}>
        <Providers>
          <Persist>
            <NextAuthProvider>
              <AlertMessage />
              <Route>
                <MainDrawr>{children}</MainDrawr>
              </Route>
            </NextAuthProvider>
          </Persist>
        </Providers>
      </body>
    </html>
  );
}
