import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />

    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#193c32",
          color: "#ffffff",
          padding: "14px 16px",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#a8c69f",
            secondary: "#193c32",
          },
        },
        error: {
          iconTheme: {
            primary: "#fca5a5",
            secondary: "#193c32",
          },
        },
      }}
    />
  </React.StrictMode>
);