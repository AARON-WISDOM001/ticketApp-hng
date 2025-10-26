import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Quick runtime Tailwind test element (temporary)
try {
  const testEl = document.createElement("div");
  testEl.className = "p-4 bg-red-600 text-white text-center";
  testEl.textContent = "TAILWIND RUNTIME TEST — should be red with white text";
  // insert at top so it's visible
  document.body.prepend(testEl);
} catch (e) {
  // ignore in non-browser environments
}
