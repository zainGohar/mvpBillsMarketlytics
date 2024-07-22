"use client";
import { useSelector } from "react-redux";
import Admin from "@/components/admin/page";
import Visitor from "@/components/visitor/page";

export default function Home() {
  const signedIn = useSelector(
    (state) => state?.entities?.credentials?.signedIn
  );
  return signedIn ? <Admin /> : <Visitor />;
}
