// src/components/ThemeToggle.jsx
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      className="btn btn-ghost btn-sm"
      aria-label="Toggle theme"
      onClick={toggle}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "🌙 Dark" : "🌞 Light"}
    </button>
  );
}
