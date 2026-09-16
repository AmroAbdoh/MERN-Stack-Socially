import { useEffect, useState } from "react";

import "./themeToggle.css";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("themechange"));
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? "☀" : "☾"}
      </span>
      {/* <span className="theme-toggle__label">{isDark ? "Light" : "Dark"}</span> */}
    </button>
  );
}

export default ThemeToggle;
