import { useEffect, useState } from "react";

export function useTheme () {
  /* initialize State & find theme data in localStorage */
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("app-theme");
    return savedTheme || "light";
  });

  /* listening on theme and ready to do side effect */
  useEffect(() => {
    /* A:setting HTML attribute <html data-theme="dark"> */
    document.documentElement.setAttribute("data-theme", theme);
    /* B:saved in localStorage */
    localStorage.setItem("app-theme", theme)
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  return { theme, toggleTheme };
}
