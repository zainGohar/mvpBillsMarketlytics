import React, { useEffect, useState } from "react";

export default function getLightDarkValue(light, dark) {
  return useTheme() === "dark" ? dark : light;
}

export const useTheme = () => {
  const getInitialTheme = () => {
    if (typeof document !== "undefined") {
      return document.body.getAttribute("data-theme") || "light";
    }
    return "light";
  };
  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateTheme = () =>
        setTheme(document.body.getAttribute("data-theme") || "light");
      window.addEventListener("themeChange", updateTheme);
      return () => window.removeEventListener("themeChange", updateTheme);
    }
  }, []);
  return theme;
};

export function toggleTheme(value) {
  const theme = document.body.getAttribute("data-theme");
  document.body.setAttribute(
    "data-theme",
    value ? value : theme === "dark" ? "light" : "dark"
  );
  localStorage.setItem("theme", document.body.getAttribute("data-theme"));
  window.dispatchEvent(new Event("themeChange"));
}
