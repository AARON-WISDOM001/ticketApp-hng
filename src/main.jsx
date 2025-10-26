import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Ensure the application wide CSS is imported
import "./index.css"; 
// Assuming App is correctly imported from your main component file
import App from "./App.jsx"; 

createRoot(document.getElementById("root")).render(
  // FIX: Removed the HashRouter wrapper, which was causing the "not defined" crash.
  // Your app uses state-based routing internally and does not need react-router-dom.
  <StrictMode>
    <App />
  </StrictMode>
);

