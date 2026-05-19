import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./main.css";

// Global error logger for debugging local runtime exceptions
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    console.error("Global captured error:", e.error);
    const container = document.getElementById("diag-console-log");
    if (container) {
      container.style.display = "block";
      container.innerText = `Error: ${e.message}\nAt: ${e.filename}:${e.lineno}:${e.colno}\nStack: ${e.error?.stack || ""}`;
    }
  });

  window.addEventListener("unhandledrejection", (e) => {
    console.error("Global captured promise rejection:", e.reason);
    const container = document.getElementById("diag-console-log");
    if (container) {
      container.style.display = "block";
      container.innerText = `Unhandled Rejection: ${e.reason?.message || e.reason}\nStack: ${e.reason?.stack || ""}`;
    }
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);