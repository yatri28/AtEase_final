import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { Toaster } from "react-hot-toast";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
              <Toaster position="top-right" />
        <App />
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);