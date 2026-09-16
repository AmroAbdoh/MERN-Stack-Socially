import { useEffect, useState } from "react";

import "./themeLogo.css";

type ThemeLogoProps = {
  alt?: string;
  className?: string;
};

type Theme = "light" | "dark";

function ThemeLogo({ alt = "Socially logo", className = "" }: ThemeLogoProps) {
  const [theme, setTheme] = useState<Theme>(
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const syncTheme = () => {
      setTheme(
        document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      );
    };

    window.addEventListener("themechange", syncTheme);

    return () => window.removeEventListener("themechange", syncTheme);
  }, []);

  const logoPath = theme === "dark" ? "/darkmode_logo.png" : "/logo.png";

  return (
    <span className={`theme-logo ${className}`.trim()}>
      <img src={logoPath} alt={alt} />
    </span>
  );
}

export default ThemeLogo;
