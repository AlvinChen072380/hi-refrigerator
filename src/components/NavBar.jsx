import { Info } from "lucide-react";
import VeganToggle from "./VeganToggle";
import { SunIcon } from "../icons/SunIcon";
import { MoonIcon } from "../icons/MoonIcon";

export default function NavBar({ setIsInfoOpen, theme, toggleTheme }) {
  return (
    <nav className="app-nav">
      {/* About 按鈕 */}
      <div style={{ paddingRight: "12px" }}>
        <button
          onClick={() => setIsInfoOpen(true)}
          className="info-button"
          title="About Tech Stack"
        >
          <Info style={{ color: "var(--primary-hover)" }} />
        </button>
      </div>

      <div style={{ marginRight: "10px" }}>
        <VeganToggle />
      </div>

      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </button>
    </nav>
  );
}
